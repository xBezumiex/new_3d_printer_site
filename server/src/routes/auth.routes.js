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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Слишком много попыток входа. Попробуйте через 15 минут',
  standardHeaders: true,
  legacyHeaders: false,
});

// ──────────────────────────────────────────────
// Локальная авторизация
// ──────────────────────────────────────────────

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login',    authLimiter, validate(loginSchema),    authController.login);
router.post('/logout',   authController.logout);
router.get ('/me',       authenticate, authController.getCurrentUser);
router.put ('/me',       authenticate, validate(updateProfileSchema), authController.updateProfile);
router.put ('/password', authenticate, validate(changePasswordSchema), authController.changePassword);

// ──────────────────────────────────────────────
// Google OAuth
// ──────────────────────────────────────────────

router.get('/google',          authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// ──────────────────────────────────────────────
// GitHub OAuth
// ──────────────────────────────────────────────

router.get('/github',          authController.githubAuth);
router.get('/github/callback', authController.githubCallback);

export default router;
