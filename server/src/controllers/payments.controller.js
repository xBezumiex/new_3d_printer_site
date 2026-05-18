import { randomUUID } from 'crypto';
import prisma from '../config/database.js';

const SHOP_ID    = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const FRONTEND   = process.env.FRONTEND_URL || 'http://localhost:5173';
const API        = 'https://api.yookassa.ru/v3';

const yoo = async (method, path, body) => {
  const credentials = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64');
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type':  'application/json',
      'Idempotence-Key': randomUUID(),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.description || `YooKassa error ${res.status}`);
  return data;
};

// POST /api/payments/create  — создать платёж
export const createPayment = async (req, res, next) => {
  try {
    const { orderId, method } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id },
    });
    if (!order) return res.status(404).json({ success: false, message: 'Заказ не найден' });

    // Маппинг метода оплаты на тип ЮКассы
    const methodTypes = {
      card:     'bank_card',
      sbp:      'sbp',
      phone:    'mobile_balance',
      operator: 'mobile_balance',
    };

    const paymentBody = {
      amount: { value: order.price.toFixed(2), currency: 'RUB' },
      confirmation: {
        type: 'redirect',
        return_url: `${FRONTEND}/payment/callback?orderId=${orderId}`,
      },
      capture: true,
      description: `Заказ #${order.orderNumber} — 3D печать`,
      metadata: { orderId: order.id, orderNumber: String(order.orderNumber) },
    };

    // Для карты и СБП — указываем тип, для остальных не указываем (YooKassa сам покажет форму)
    if (method === 'card' || method === 'sbp') {
      paymentBody.payment_method_data = { type: methodTypes[method] };
    }

    const payment = await yoo('POST', '/payments', paymentBody);

    res.json({
      success: true,
      data: {
        paymentId:       payment.id,
        confirmationUrl: payment.confirmation.confirmation_url,
        status:          payment.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/:paymentId  — проверить статус
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await yoo('GET', `/payments/${paymentId}`);

    // Если платёж успешен — обновляем статус заказа
    if (payment.paid && payment.status === 'succeeded') {
      const orderId = payment.metadata?.orderId;
      if (orderId) {
        const order = await prisma.order.findFirst({ where: { id: orderId } });
        if (order && order.status === 'PENDING') {
          await prisma.order.update({
            where: { id: orderId },
            data:  { status: 'CONFIRMED' },
          });
          await prisma.orderEvent.create({
            data: { orderId, status: 'CONFIRMED', note: 'Оплата подтверждена через ЮКассу' },
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        status: payment.status,
        paid:   payment.paid,
        amount: payment.amount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/webhook  — вебхук от ЮКассы
export const webhook = async (req, res, next) => {
  try {
    const event = req.body;
    if (event?.type === 'payment.succeeded') {
      const orderId = event.object?.metadata?.orderId;
      if (orderId) {
        const order = await prisma.order.findFirst({ where: { id: orderId } });
        if (order && order.status === 'PENDING') {
          await prisma.order.update({
            where: { id: orderId },
            data:  { status: 'CONFIRMED' },
          });
          await prisma.orderEvent.create({
            data: { orderId, status: 'CONFIRMED', note: 'Оплата через ЮКассу (webhook)' },
          });
        }
      }
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
