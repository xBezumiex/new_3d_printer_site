// Роуты для подписок
import express from 'express';
import * as subscriptionsController from '../controllers/subscriptions.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { subscribeSchema } from '../validators/subscriptions.validator.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authenticate);

// Подписаться
router.post('/', validate(subscribeSchema), subscriptionsController.subscribe);

// Отписаться
router.delete('/:id', subscriptionsController.unsubscribe);

// Получить подписчиков пользователя
router.get('/:id/followers', subscriptionsController.getFollowers);

// Получить подписки пользователя
router.get('/:id/following', subscriptionsController.getFollowing);

// Проверить статус подписки
router.get('/:id/check', subscriptionsController.checkFollowing);

export default router;
