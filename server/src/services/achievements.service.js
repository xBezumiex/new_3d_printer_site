import prisma from '../config/database.js';
import { createNotification } from './notifications.service.js';

const ACHIEVEMENTS = [
  {
    type: 'FIRST_POST',
    label: 'Первый пост',
    check: async (userId) => {
      const count = await prisma.post.count({ where: { userId } });
      return count >= 1;
    },
  },
  {
    type: 'TEN_POSTS',
    label: '10 постов',
    check: async (userId) => {
      const count = await prisma.post.count({ where: { userId } });
      return count >= 10;
    },
  },
  {
    type: 'FIRST_FOLLOWER_TEN',
    label: '10 подписчиков',
    check: async (userId) => {
      const count = await prisma.subscription.count({ where: { subscribedToId: userId } });
      return count >= 10;
    },
  },
  {
    type: 'FIRST_ORDER',
    label: 'Первый заказ',
    check: async (userId) => {
      const count = await prisma.order.count({ where: { userId } });
      return count >= 1;
    },
  },
  {
    type: 'POPULAR_POST',
    label: 'Популярный пост',
    check: async (userId) => {
      const post = await prisma.post.findFirst({ where: { userId, likes: { gte: 50 } } });
      return !!post;
    },
  },
  {
    type: 'PROFILE_COMPLETE',
    label: 'Профиль заполнен',
    check: async (userId) => {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatar: true, bio: true, phone: true } });
      return !!(user?.avatar && user?.bio && user?.phone);
    },
  },
];

export const checkAndAwardAchievements = async (userId) => {
  const existing = await prisma.achievement.findMany({ where: { userId }, select: { type: true } });
  const existingTypes = new Set(existing.map(a => a.type));

  for (const ach of ACHIEVEMENTS) {
    if (existingTypes.has(ach.type)) continue;
    try {
      const earned = await ach.check(userId);
      if (earned) {
        await prisma.achievement.create({ data: { userId, type: ach.type } });
        createNotification(userId, 'ACHIEVEMENT_EARNED', `🏆 Достижение: «${ach.label}»`).catch(() => {});
      }
    } catch {}
  }
};

export const getUserAchievements = async (userId) => {
  const earned = await prisma.achievement.findMany({ where: { userId }, orderBy: { earnedAt: 'asc' } });
  return earned;
};

export const ALL_ACHIEVEMENTS = ACHIEVEMENTS;
