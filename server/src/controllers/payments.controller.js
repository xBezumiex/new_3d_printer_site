import { randomUUID } from 'crypto';
import https from 'https';
import prisma from '../config/database.js';

const SHOP_ID    = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const FRONTEND   = process.env.FRONTEND_URL || 'http://localhost:5173';

// HTTP-клиент для ЮКассы (без внешних зависимостей, работает на любом Node)
const yoo = (method, path, body) => new Promise((resolve, reject) => {
  const credentials = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64');
  const payload     = body ? JSON.stringify(body) : null;

  const options = {
    hostname: 'api.yookassa.ru',
    path:     `/v3${path}`,
    method,
    headers: {
      'Authorization':   `Basic ${credentials}`,
      'Content-Type':    'application/json',
      'Idempotence-Key': randomUUID(),
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
    },
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (res.statusCode >= 400) return reject(new Error(json.description || `YooKassa ${res.statusCode}`));
        resolve(json);
      } catch {
        reject(new Error('Некорректный ответ от ЮКассы'));
      }
    });
  });

  req.on('error', reject);
  if (payload) req.write(payload);
  req.end();
});

// POST /api/payments/create
export const createPayment = async (req, res, next) => {
  try {
    const { orderId, method } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: 'orderId обязателен' });

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user.id },
    });
    if (!order) return res.status(404).json({ success: false, message: 'Заказ не найден' });

    const paymentBody = {
      amount: { value: Number(order.price).toFixed(2), currency: 'RUB' },
      confirmation: {
        type:       'redirect',
        return_url: `${FRONTEND}/payment/callback?orderId=${orderId}`,
      },
      capture:     true,
      description: `Заказ #${order.orderNumber} — 3D печать`,
      metadata:    { orderId: order.id, orderNumber: String(order.orderNumber) },
    };

    // Карта и СБП — указываем тип явно
    if (method === 'card') {
      paymentBody.payment_method_data = { type: 'bank_card' };
    } else if (method === 'sbp') {
      paymentBody.payment_method_data = { type: 'sbp' };
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

// GET /api/payments/:paymentId
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await yoo('GET', `/payments/${paymentId}`);

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
      data: { status: payment.status, paid: payment.paid, amount: payment.amount },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/webhook
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
