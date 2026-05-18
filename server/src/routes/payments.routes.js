import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createPayment, getPaymentStatus, webhook } from '../controllers/payments.controller.js';

const router = express.Router();

// Вебхук — без авторизации (ЮКасса сама вызывает)
router.post('/webhook', webhook);

// Остальные роуты — с авторизацией
router.use(authenticate);

router.post('/create', createPayment);
router.get('/:paymentId', getPaymentStatus);

export default router;
