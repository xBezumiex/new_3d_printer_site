// Express приложение
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { corsOptions } from './config/cors.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import postsRoutes from './routes/posts.routes.js';
import usersRoutes from './routes/users.routes.js';
import searchRoutes from './routes/search.routes.js';
import subscriptionsRoutes from './routes/subscriptions.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import imagesRoutes from './routes/images.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import blocksRoutes from './routes/blocks.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import bookmarksRoutes from './routes/bookmarks.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import promoRoutes from './routes/promo.routes.js';
import achievementsRoutes from './routes/achievements.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Загрузка переменных окружения
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ===================
// Middleware
// ===================

// Безопасность
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Компрессия
app.use(compression());

// Логирование
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting (общий лимит)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 500, // макс 500 запросов с одного IP
  message: 'Слишком много запросов с этого IP, попробуйте позже',
  standardHeaders: true,
  legacyHeaders: false,
});

// Строгий лимит для auth (защита от брутфорса)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 15, // макс 15 попыток с одного IP
  message: 'Слишком много попыток входа, попробуйте через 15 минут',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // не считать успешные запросы
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Статические файлы (загруженные изображения — legacy)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Изображения из БД — доступны по /api/images и /img
app.use('/api/images', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, imagesRoutes);
app.use('/img', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, imagesRoutes);

// ===================
// Маршруты
// ===================

// Health check
const healthHandler = (req, res) => {
  res.json({
    success: true,
    message: '3D Print Lab API работает',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: 'v2-notifications-bookmarks',
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/blocks', blocksRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/bookmarks', bookmarksRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/achievements', achievementsRoutes);

// ===================
// Обработка ошибок
// ===================

// 404 Not Found
app.use(notFoundHandler);

// Глобальный обработчик ошибок
app.use(errorHandler);

export default app;
