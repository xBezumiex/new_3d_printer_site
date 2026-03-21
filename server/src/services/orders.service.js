// Сервис заказов
import prisma from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { sendOrderConfirmation, sendOrderNotificationToAdmin } from './email.service.js';

/**
 * Создание нового заказа
 */
export const createOrder = async (userId, orderData) => {
  // Получение данных пользователя для email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true
    }
  });

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  // Создание заказа
  const order = await prisma.order.create({
    data: {
      userId,
      modelFile: orderData.modelFile,
      material: orderData.material,
      quality: orderData.quality,
      infill: orderData.infill,
      quantity: orderData.quantity,
      volume: orderData.volume,
      weight: orderData.weight,
      price: orderData.price,
      comments: orderData.comments || null
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  // Отправка email уведомлений (асинхронно, не блокируем ответ)
  Promise.all([
    sendOrderConfirmation(user, order),
    sendOrderNotificationToAdmin(user, order)
  ]).catch(err => {
    console.error('Ошибка отправки email уведомлений:', err);
  });

  return order;
};

/**
 * Получение списка заказов с фильтрацией и пагинацией
 */
export const getOrders = async (userId, isAdmin, filters = {}) => {
  const {
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters;

  // req.query приходит строками — явно конвертируем в числа
  const page  = parseInt(filters.page,  10) || 1;
  const limit = parseInt(filters.limit, 10) || 10;

  const skip = (page - 1) * limit;

  // Условия фильтрации
  const where = {};

  // Если не админ, показываем только свои заказы
  if (!isAdmin) {
    where.userId = userId;
  }

  // Фильтр по статусу
  if (status) {
    where.status = status;
  }

  // Получение заказов
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    }),
    prisma.order.count({ where })
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Получение заказа по ID
 */
export const getOrderById = async (orderId, userId, isAdmin) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true
        }
      }
    }
  });

  if (!order) {
    throw new NotFoundError('Заказ не найден');
  }

  // Проверка доступа (только владелец или админ)
  if (!isAdmin && order.userId !== userId) {
    throw new ForbiddenError('Доступ к этому заказу запрещён');
  }

  return order;
};

/**
 * Обновление статуса заказа (только для админа)
 */
export const updateOrderStatus = async (orderId, status) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    throw new NotFoundError('Заказ не найден');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });

  // Отправить email клиенту об изменении статуса
  if (updatedOrder.user?.email) {
    const STATUS_LABELS = {
      PENDING: 'Ожидает обработки',
      CONFIRMED: 'Подтверждён',
      IN_PROGRESS: 'В работе',
      COMPLETED: 'Выполнен',
      CANCELLED: 'Отменён',
    };
    try {
      const transporter = (await import('../config/email.js')).default;
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '3D Print Lab <noreply@3dprintlab.com>',
        to: updatedOrder.user.email,
        subject: `Статус заказа изменён — 3D Print Lab`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#3b82f6">Статус вашего заказа изменён</h2>
          <p>Здравствуйте, <strong>${updatedOrder.user.name}</strong>!</p>
          <p>Статус вашего заказа обновлён:</p>
          <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0;text-align:center">
            <p style="font-size:22px;font-weight:bold;color:#3b82f6;margin:0">${STATUS_LABELS[status] || status}</p>
          </div>
          <p style="color:#6b7280;font-size:14px">С уважением,<br>Команда 3D Print Lab</p>
        </div>`
      });
    } catch (e) {
      console.error('Ошибка отправки email об изменении статуса:', e.message);
    }
  }

  return updatedOrder;
};

/**
 * Удаление заказа (только владелец или админ)
 */
export const deleteOrder = async (orderId, userId, isAdmin) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    throw new NotFoundError('Заказ не найден');
  }

  // Проверка доступа
  if (!isAdmin && order.userId !== userId) {
    throw new ForbiddenError('Вы не можете удалить этот заказ');
  }

  // Запретить удаление заказов в работе (только PENDING и CANCELLED)
  if (!isAdmin && !['PENDING', 'CANCELLED'].includes(order.status)) {
    throw new ForbiddenError('Нельзя удалить заказ в работе');
  }

  await prisma.order.delete({
    where: { id: orderId }
  });

  return { message: 'Заказ успешно удалён' };
};

/**
 * Получение статистики заказов для админа
 */
export const getOrdersStats = async () => {
  const [
    total,
    pending,
    confirmed,
    inProgress,
    completed,
    cancelled,
    totalRevenue
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'CONFIRMED' } }),
    prisma.order.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.order.count({ where: { status: 'CANCELLED' } }),
    prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { price: true }
    })
  ]);

  return {
    total,
    byStatus: {
      pending,
      confirmed,
      inProgress,
      completed,
      cancelled
    },
    totalRevenue: totalRevenue._sum.price || 0
  };
};
