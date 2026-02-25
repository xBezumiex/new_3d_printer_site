// Сервис для работы с пользователями
import prisma from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

// Получение списка пользователей с пагинацией и поиском
export const getUsers = async (query = {}) => {
  const { page = 1, limit = 10, search } = query;
  const skip = (page - 1) * limit;

  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            orders: true,
            subscribers: true,
            subscriptions: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// Получение пользователя по ID
export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          orders: true,
          subscribers: true,
          subscriptions: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  return user;
};

// Обновление профиля пользователя
export const updateUserProfile = async (userId, requestUserId, userRole, updateData) => {
  // Проверка прав: только сам пользователь или админ может редактировать
  if (userId !== requestUserId && userRole !== 'ADMIN') {
    throw new ForbiddenError('Нет прав на редактирование этого профиля');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return updatedUser;
};

// Получение постов пользователя
export const getUserPosts = async (userId, query = {}) => {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { userId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        images: {
          take: 1,
        },
        _count: {
          select: {
            images: true,
          },
        },
      },
    }),
    prisma.post.count({ where: { userId: userId } }),
  ]);

  return {
    posts,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};
