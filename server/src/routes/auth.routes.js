// Маршруты авторизации
import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../validators/auth.validator.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting для auth endpoints (более строгий)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // макс 5 попыток
  message: 'Слишком много попыток входа. Попробуйте через 15 минут',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/auth/register
 * @desc    Регистрация нового пользователя
 * @access  Public
 */
router.post('/register', authLimiter, validate(registerSchema), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Логин пользователя
 * @access  Public
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Логаут (клиент удаляет токен)
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Получить текущего пользователя
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   PUT /api/auth/me
 * @desc    Обновить профиль
 * @access  Private
 */
router.put('/me', authenticate, validate(updateProfileSchema), authController.updateProfile);

/**
 * @route   PUT /api/auth/password
 * @desc    Изменить пароль
 * @access  Private
 */
router.put('/password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;
