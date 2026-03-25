import express from 'express';
import * as c from '../controllers/likes.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate);

router.post('/', c.toggleLike);
router.get('/', c.checkLike);

export default router;
