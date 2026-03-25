import express from 'express';
import * as c from '../controllers/bookmarks.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/', c.getUserBookmarks);
router.post('/:postId', c.toggleBookmark);
router.get('/:postId/check', c.checkBookmark);

export default router;
