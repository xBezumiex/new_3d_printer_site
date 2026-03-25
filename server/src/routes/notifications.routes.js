import express from 'express';
import * as c from '../controllers/notifications.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/unread', c.getUnreadCount);
router.get('/', c.getNotifications);
router.put('/read-all', c.markAllRead);
router.put('/:id/read', c.markOneRead);
router.delete('/:id', c.deleteNotification);

export default router;
