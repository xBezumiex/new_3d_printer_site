// Сервис для подписок
import prisma from '../config/database.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { createNotification } from './notifications.service.js';
import { checkAndAwardAchievements } from './achievements.service.js';
import { sendFollowerNotification } from './email.service.js';

// Подписаться на пользователя
export const subscribe = async (subscriberId, subscribedToId) => {
  // Проверка: нельзя подписаться на самого себя
  if (subscriberId === subscribedToId) {
    throw new BadRequestError('Нельзя подписаться на самого себя');
  }

  // Проверка существования пользователя
  const targetUser = await prisma.user.findUnique({
    where: { id: subscribedToId },
  });

  if (!targetUser) {
    throw new NotFoundError('Пользователь не найден');
  }

  // Проверка: уже подписан?
  const existingSubscription = await prisma.subscription.findUnique({
    where: {
      subscriberId_subscribedToId: {
        subscriberId,
        subscribedToId,
      },
    },
  });

  if (existingSubscription) {
    throw new BadRequestError('Вы уже подписаны на этого пользователя');
  }

  // Создать подписку
  const subscription = await prisma.subscription.create({
    data: {
      subscriberId,
      subscribedToId,
    },
    include: {
      subscribedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
        },
      },
    },
  });

  // Уведомление и ачивки (не блокируем ответ)
  const [subUser, targetUserFull] = await Promise.all([
    prisma.user.findUnique({ where: { id: subscriberId }, select: { name: true } }),
    prisma.user.findUnique({ where: { id: subscribedToId }, select: { id: true, name: true, email: true } }),
  ]);
  createNotification(subscribedToId, 'NEW_FOLLOWER', `${subUser?.name} подписался(ась) на вас`, `/users/${subscriberId}`).catch(() => {});
  sendFollowerNotification(targetUserFull, subUser?.name, subscriberId).catch(() => {});
  checkAndAwardAchievements(subscribedToId).catch(() => {});

  return subscription;
};

// Отписаться от пользователя
export const unsubscribe = async (subscriberId, subscribedToId) => {
  // Найти подписку
  const subscription = await prisma.subscription.findUnique({
    where: {
      subscriberId_subscribedToId: {
        subscriberId,
        subscribedToId,
      },
    },
  });

  if (!subscription) {
    throw new NotFoundError('Подписка не найдена');
  }

  // Удалить подписку
  await prisma.subscription.delete({
    where: {
      subscriberId_subscribedToId: {
        subscriberId,
        subscribedToId,
      },
    },
  });

  return { message: 'Подписка отменена' };
};

// Получить подписчиков пользователя (кто подписан на него)
export const getFollowers = async (userId) => {
  const subscriptions = await prisma.subscription.findMany({
    where: { subscribedToId: userId },
    include: {
      subscriber: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              subscribers: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return subscriptions.map((sub) => sub.subscriber);
};

// Получить подписки пользователя (на кого он подписан)
export const getFollowing = async (userId) => {
  const subscriptions = await prisma.subscription.findMany({
    where: { subscriberId: userId },
    include: {
      subscribedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              subscribers: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return subscriptions.map((sub) => sub.subscribedTo);
};

// Проверить, подписан ли пользователь A на пользователя B
export const isFollowing = async (subscriberId, subscribedToId) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      subscriberId_subscribedToId: {
        subscriberId,
        subscribedToId,
      },
    },
  });

  return !!subscription;
};
