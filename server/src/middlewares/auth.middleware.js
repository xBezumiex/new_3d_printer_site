// Middleware для проверки авторизации
import { verifyToken } from '../utils/generateToken.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import prisma from '../config/database.js';

/**
 * Middleware для проверки JWT токена
 */
export const authenticate = async (req, res, next) => {
  try {
    // Получение токена из заголовка Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Токен не предоставлен');
    }

    const token = authHeader.split(' ')[1];

    // Верификация токена
    const decoded = verifyToken(token);

    // Проверка существования пользователя
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('Пользователь не найден');
    }

    // Добавление данных пользователя в req
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Невалидный токен'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Токен истёк'));
    }
    next(error);
  }
};

/**
 * Middleware для проверки роли администратора
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Требуется авторизация'));
  }

  if (req.user.role !== 'ADMIN') {
    return next(new ForbiddenError('Доступ запрещён. Требуются права администратора'));
  }

  next();
};

/**
 * Middleware для проверки владельца ресурса или админа
 */
export const requireOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Требуется авторизация'));
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    if (req.user.role === 'ADMIN' || req.user.id === resourceUserId) {
      return next();
    }

    return next(new ForbiddenError('Доступ запрещён'));
  };
};
