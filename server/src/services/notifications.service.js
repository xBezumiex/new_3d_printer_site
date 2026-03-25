import prisma from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export const createNotification = async (userId, type, message, link = null) => {
  return prisma.notification.create({ data: { userId, type, message, link } });
};

export const getNotifications = async (userId, page = 1, limit = 30) => {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { notifications, total, page, limit };
};

export const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({ where: { userId, isRead: false } });
  return { count };
};

export const markOneRead = async (notifId, userId) => {
  const n = await prisma.notification.findUnique({ where: { id: notifId } });
  if (!n) throw new NotFoundError('Уведомление не найдено');
  if (n.userId !== userId) throw new ForbiddenError('Нет доступа');
  return prisma.notification.update({ where: { id: notifId }, data: { isRead: true } });
};

export const markAllRead = async (userId) => {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  return { success: true };
};

export const deleteNotification = async (notifId, userId) => {
  const n = await prisma.notification.findUnique({ where: { id: notifId } });
  if (!n) throw new NotFoundError('Уведомление не найдено');
  if (n.userId !== userId) throw new ForbiddenError('Нет доступа');
  await prisma.notification.delete({ where: { id: notifId } });
  return { success: true };
};
