import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

const POST_INCLUDE = {
  user: { select: { id: true, name: true, avatar: true } },
  images: { take: 1 },
  _count: { select: { images: true } },
};

export const toggleBookmark = async (postId, userId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new NotFoundError('Пост не найден');

  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { userId_postId: { userId, postId } } });
    return { bookmarked: false };
  }

  await prisma.bookmark.create({ data: { userId, postId } });
  return { bookmarked: true };
};

export const checkBookmark = async (postId, userId) => {
  const b = await prisma.bookmark.findUnique({ where: { userId_postId: { userId, postId } } });
  return { bookmarked: !!b };
};

export const getUserBookmarks = async (userId, page = 1, limit = 12) => {
  const skip = (page - 1) * limit;
  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { post: { include: POST_INCLUDE } },
    }),
    prisma.bookmark.count({ where: { userId } }),
  ]);
  return { posts: bookmarks.map(b => b.post), total, page, limit };
};
