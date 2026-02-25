// Маршруты заказов
import express from 'express';
import * as ordersController from '../controllers/orders.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  getOrdersQuerySchema
} from '../validators/orders.validator.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authenticate);

/**
 * @route   POST /api/orders
 * @desc    Создать новый заказ
 * @access  Private
 */
router.post('/', validate(createOrderSchema), ordersController.createOrder);

/**
 * @route   GET /api/orders/stats
 * @desc    Получить статистику заказов
 * @access  Admin
 */
router.get('/stats', requireAdmin, ordersController.getOrdersStats);

/**
 * @route   GET /api/orders
 * @desc    Получить список заказов (свои или все для админа)
 * @access  Private
 */
router.get('/', ordersController.getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Получить заказ по ID
 * @access  Private (владелец или админ)
 */
router.get('/:id', ordersController.getOrderById);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Обновить статус заказа
 * @access  Admin
 */
router.put('/:id/status', requireAdmin, validate(updateOrderStatusSchema), ordersController.updateOrderStatus);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Удалить заказ
 * @access  Private (владелец) или Admin
 */
router.delete('/:id', ordersController.deleteOrder);

export default router;
