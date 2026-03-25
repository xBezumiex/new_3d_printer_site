import prisma from '../config/database.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

// Заблокировать пользователя
export const blockUser = async (blockerId, blockedId) => {
  if (blockerId === blockedId) throw new BadRequestError('Нельзя заблокировать себя');

  const target = await prisma.user.findUnique({ where: { id: blockedId } });
  if (!target) throw new NotFoundError('Пользователь не найден');

  const existing = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId, blockedId } },
  });
  if (existing) throw new BadRequestError('Пользователь уже заблокирован');

  // При блокировке — снять взаимные подписки
  await prisma.subscription.deleteMany({
    where: {
      OR: [
        { subscriberId: blockerId, subscribedToId: blockedId },
        { subscriberId: blockedId, subscribedToId: blockerId },
      ],
    },
  });

  await prisma.block.create({ data: { blockerId, blockedId } });
  return { blocked: true };
};

// Разблокировать пользователя
export const unblockUser = async (blockerId, blockedId) => {
  const block = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId, blockedId } },
  });
  if (!block) throw new NotFoundError('Блокировка не найдена');

  await prisma.block.delete({
    where: { blockerId_blockedId: { blockerId, blockedId } },
  });
  return { blocked: false };
};

// Проверить статус блокировки
export const checkBlock = async (userId, targetId) => {
  const [iBlocked, theyBlocked] = await Promise.all([
    prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: userId, blockedId: targetId } },
    }),
    prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: targetId, blockedId: userId } },
    }),
  ]);
  return { iBlocked: !!iBlocked, theyBlocked: !!theyBlocked };
};

// Список заблокированных пользователей
export const getBlockedUsers = async (userId) => {
  const blocks = await prisma.block.findMany({
    where: { blockerId: userId },
    include: {
      blocked: {
        select: { id: true, name: true, avatar: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return blocks.map((b) => b.blocked);
};
