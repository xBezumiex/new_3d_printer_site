import prisma from '../config/database.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';

const USER_SELECT = {
  id: true,
  name: true,
  avatar: true,
  lastActivity: true,
};

// Проверить, не заблокированы ли пользователи друг другом
async function checkBlocked(userAId, userBId) {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userAId, blockedId: userBId },
        { blockerId: userBId, blockedId: userAId },
      ],
    },
  });
  return !!block;
}

// Получить список диалогов пользователя (последнее сообщение в каждом)
export const getConversations = async (userId) => {
  // Найти всех собеседников
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: USER_SELECT },
      receiver: { select: USER_SELECT },
    },
  });

  // Сгруппировать по собеседнику, оставить только последнее сообщение
  const seen = new Set();
  const conversations = [];

  for (const msg of messages) {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (seen.has(partnerId)) continue;
    seen.add(partnerId);

    const unread = await prisma.message.count({
      where: { senderId: partnerId, receiverId: userId, isRead: false },
    });

    conversations.push({
      partner: msg.senderId === userId ? msg.receiver : msg.sender,
      lastMessage: msg,
      unreadCount: unread,
    });
  }

  return conversations;
};

// Получить переписку между двумя пользователями
export const getMessages = async (userId, partnerId, page = 1, limit = 50) => {
  const targetUser = await prisma.user.findUnique({ where: { id: partnerId } });
  if (!targetUser) throw new NotFoundError('Пользователь не найден');

  if (await checkBlocked(userId, partnerId)) {
    throw new ForbiddenError('Переписка недоступна');
  }

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
      include: {
        sender: { select: USER_SELECT },
      },
    }),
    prisma.message.count({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
    }),
  ]);

  // Пометить входящие как прочитанные
  await prisma.message.updateMany({
    where: { senderId: partnerId, receiverId: userId, isRead: false },
    data: { isRead: true },
  });

  return { messages, total, page, limit };
};

// Отправить сообщение
export const sendMessage = async (senderId, receiverId, text, imageUrl) => {
  if (senderId === receiverId) throw new BadRequestError('Нельзя писать самому себе');
  if (!text && !imageUrl) throw new BadRequestError('Сообщение не может быть пустым');

  const targetUser = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!targetUser) throw new NotFoundError('Пользователь не найден');

  if (await checkBlocked(senderId, receiverId)) {
    throw new ForbiddenError('Отправка сообщений заблокирована');
  }

  const message = await prisma.message.create({
    data: { senderId, receiverId, text, imageUrl },
    include: { sender: { select: USER_SELECT } },
  });

  return message;
};

// Удалить сообщение (только своё)
export const deleteMessage = async (messageId, userId) => {
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (!msg) throw new NotFoundError('Сообщение не найдено');
  if (msg.senderId !== userId) throw new ForbiddenError('Нельзя удалить чужое сообщение');

  await prisma.message.delete({ where: { id: messageId } });
  return { success: true };
};

// Количество непрочитанных сообщений
export const getUnreadCount = async (userId) => {
  const count = await prisma.message.count({
    where: { receiverId: userId, isRead: false },
  });
  return { count };
};
