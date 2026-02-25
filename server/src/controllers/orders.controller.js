// Контроллер заказов
import * as ordersService from '../services/orders.service.js';

/**
 * Создание нового заказа
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    const order = await ordersService.createOrder(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Заказ успешно создан',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение списка заказов
 * GET /api/orders
 */
export const getOrders = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const result = await ordersService.getOrders(req.user.id, isAdmin, req.query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение заказа по ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const order = await ordersService.getOrderById(req.params.id, req.user.id, isAdmin);

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление статуса заказа (только админ)
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await ordersService.updateOrderStatus(req.params.id, req.body.status);

    res.status(200).json({
      success: true,
      message: 'Статус заказа обновлён',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Удаление заказа
 * DELETE /api/orders/:id
 */
export const deleteOrder = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'ADMIN';
    const result = await ordersService.deleteOrder(req.params.id, req.user.id, isAdmin);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение статистики заказов (только админ)
 * GET /api/orders/stats
 */
export const getOrdersStats = async (req, res, next) => {
  try {
    const stats = await ordersService.getOrdersStats();

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};
