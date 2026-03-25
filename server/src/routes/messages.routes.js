import express from 'express';
import * as messagesController from '../controllers/messages.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/unread', messagesController.getUnreadCount);
router.get('/', messagesController.getConversations);
router.get('/:userId', messagesController.getMessages);
router.post('/:userId', messagesController.sendMessage);
router.delete('/:messageId', messagesController.deleteMessage);

export default router;
