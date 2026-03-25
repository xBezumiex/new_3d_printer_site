import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { createNotification } from './notifications.service.js';
import { checkAndAwardAchievements } from './achievements.service.js';

export const toggleLike = async (postId, userId) => {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, userId: true } });
  if (!post) throw new NotFoundError('Пост не найден');

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { userId_postId: { userId, postId } } });
    await prisma.post.update({ where: { id: postId }, data: { likes: { decrement: 1 } } });
    return { liked: false };
  }

  await prisma.postLike.create({ data: { userId, postId } });
  const updated = await prisma.post.update({ where: { id: postId }, data: { likes: { increment: 1 } } });

  // Уведомление автору (не самому себе)
  if (post.userId !== userId) {
    const liker = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    createNotification(post.userId, 'POST_LIKED', `${liker?.name} оценил(а) ваш пост`, `/posts/${postId}`).catch(() => {});
  }

  // Ачивка POPULAR_POST при 50 лайках
  if (updated.likes >= 50) {
    checkAndAwardAchievements(post.userId).catch(() => {});
  }

  return { liked: true, count: updated.likes };
};

export const checkLike = async (postId, userId) => {
  const like = await prisma.postLike.findUnique({
    where: { userId_postId: { userId, postId } },
  });
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { likes: true } });
  return { liked: !!like, count: post?.likes || 0 };
};
