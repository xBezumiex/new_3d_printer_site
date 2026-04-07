// Сервис для работы с постами
import prisma from '../config/database.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { stripHtml } from '../utils/sanitize.js';
import { sendCommentNotification } from './email.service.js';

// Создание поста
export const createPost = async (userId, postData) => {
  const post = await prisma.post.create({
    data: {
      title: stripHtml(postData.title),
      description: stripHtml(postData.description),
      tags: Array.isArray(postData.tags)
        ? postData.tags
        : typeof postData.tags === 'string' && postData.tags.trim()
          ? postData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : [],
      user: {
        connect: { id: userId },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      images: true,
      _count: {
        select: {
          images: true,
        },
      },
    },
  });

  return post;
};

// Получение списка постов с пагинацией и фильтрами
export const getPosts = async (query = {}) => {
  const { page = 1, limit = 10, userId, search, tag, sort, order } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};

  if (userId) where.userId = userId;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (tag) where.tags = { has: tag };

  const SORT_FIELD_MAP = { likes: 'likes', views: 'views', createdAt: 'createdAt' };
  const sortField = SORT_FIELD_MAP[sort] || 'createdAt';
  const sortDir = order === 'asc' ? 'asc' : 'desc';

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { [sortField]: sortDir },
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
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

// Получение поста по ID
export const getPostById = async (postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
        },
      },
      images: true,
    },
  });

  if (!post) {
    throw new NotFoundError('Пост не найден');
  }

  return post;
};

// Обновление поста
export const updatePost = async (postId, userId, userRole, updateData) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new NotFoundError('Пост не найден');
  }

  // Проверка прав: только автор или админ может редактировать
  if (post.userId !== userId && userRole !== 'ADMIN') {
    throw new ForbiddenError('Нет прав на редактирование этого поста');
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      images: true,
    },
  });

  return updatedPost;
};

// Удаление поста
export const deletePost = async (postId, userId, userRole) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      images: true,
    },
  });

  if (!post) {
    throw new NotFoundError('Пост не найден');
  }

  // Проверка прав: только автор или админ может удалять
  if (post.userId !== userId && userRole !== 'ADMIN') {
    throw new ForbiddenError('Нет прав на удаление этого поста');
  }

  // Удаление поста (изображения удалятся автоматически благодаря onDelete: Cascade)
  await prisma.post.delete({
    where: { id: postId },
  });

  return { message: 'Пост успешно удален' };
};

// Добавление изображений к посту
export const addImagesToPost = async (postId, userId, imageUrls) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new NotFoundError('Пост не найден');
  }

  if (post.userId !== userId) {
    throw new ForbiddenError('Нет прав на добавление изображений к этому посту');
  }

  // Создание записей изображений
  const images = await prisma.image.createMany({
    data: imageUrls.map((url) => ({
      url,
      publicId: url.split('/').pop()?.split('.')[0] || 'unknown',
      postId,
    })),
  });

  // Возврат обновленного поста с изображениями
  const updatedPost = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      images: true,
    },
  });

  return updatedPost;
};

// Лайк/дизлайк поста (атомарный инкремент/декремент)
export const likePost = async (postId, increment) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Пост не найден');

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { likes: { [increment ? 'increment' : 'decrement']: 1 } },
  });

  return { likes: updated.likes };
};

// Получение комментариев поста
export const getComments = async (postId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Пост не найден');

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  return comments;
};

// Добавление комментария к посту
export const addComment = async (postId, userId, text) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!post) throw new NotFoundError('Пост не найден');

  const cleanText = stripHtml(text);

  const comment = await prisma.comment.create({
    data: { text: cleanText, postId, userId },
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  // Email уведомление автору поста (не самому себе)
  if (post.userId !== userId && post.user?.email) {
    sendCommentNotification(post.user, comment.user?.name, cleanText, post.title, postId).catch(() => {});
  }

  return comment;
};

// Удаление комментария
export const deleteComment = async (commentId, userId, userRole) => {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new NotFoundError('Комментарий не найден');

  if (comment.userId !== userId && userRole !== 'ADMIN') {
    throw new ForbiddenError('Нет прав на удаление этого комментария');
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return { message: 'Комментарий удален' };
};

// Удаление изображения из поста
export const deleteImageFromPost = async (imageId, userId, userRole) => {
  const image = await prisma.image.findUnique({
    where: { id: imageId },
    include: {
      post: true,
    },
  });

  if (!image) {
    throw new NotFoundError('Изображение не найдено');
  }

  // Проверка прав
  if (image.post.userId !== userId && userRole !== 'ADMIN') {
    throw new ForbiddenError('Нет прав на удаление этого изображения');
  }

  await prisma.image.delete({
    where: { id: imageId },
  });

  return { message: 'Изображение успешно удалено' };
};
