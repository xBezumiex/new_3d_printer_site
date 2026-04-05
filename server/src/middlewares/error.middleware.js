// Middleware для обработки ошибок
import { AppError } from '../utils/errors.js';

// Обработка ошибок Prisma
const handlePrismaError = (err) => {
  if (err.code === 'P2002') {
    return new AppError('Запись с такими данными уже существует', 409);
  }
  if (err.code === 'P2025') {
    return new AppError('Запись не найдена', 404);
  }
  return new AppError('Ошибка базы данных', 500);
};

// Обработка ошибок валидации Joi
const handleValidationError = (err) => {
  const message = err.details.map(detail => detail.message).join(', ');
  return new AppError(message, 400);
};

// Главный обработчик ошибок
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Логирование ошибок (всегда, чтобы видеть ошибки на Render)
  console.error(`[${new Date().toISOString()}] ERROR ${req.method} ${req.url}:`, err.message);
  if (err.stack) console.error(err.stack);

  // Prisma ошибки
  if (err.code && err.code.startsWith('P')) {
    error = handlePrismaError(err);
  }

  // Joi validation ошибки
  if (err.isJoi) {
    error = handleValidationError(err);
  }

  // JWT ошибки
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Невалидный токен', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Токен истёк', 401);
  }

  // Отправка ответа
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 Not Found
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Маршрут ${req.originalUrl} не найден`, 404);
  next(error);
};
