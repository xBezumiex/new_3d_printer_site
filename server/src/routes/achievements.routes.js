import express from 'express';
import * as c from '../controllers/achievements.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me', authenticate, c.getUserAchievements);
router.get('/:userId', c.getUserAchievements);

export default router;
