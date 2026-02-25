// Сервис для поиска
import prisma from '../config/database.js';

// Поиск постов
export const searchPosts = async (query, limit = 10) => {
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
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
  });

  return posts;
};

// Поиск пользователей
export const searchUsers = async (query, limit = 10) => {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ],
    },
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
  });

  return users;
};

// Комбинированный поиск
export const searchAll = async (query, limit = 10) => {
  const [posts, users] = await Promise.all([
    searchPosts(query, limit),
    searchUsers(query, limit),
  ]);

  return {
    posts,
    users,
    total: posts.length + users.length,
  };
};
