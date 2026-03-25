import express from 'express';
import * as blocksController from '../controllers/blocks.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', blocksController.getBlockedUsers);
router.get('/:userId/check', blocksController.checkBlock);
router.post('/:userId', blocksController.blockUser);
router.delete('/:userId', blocksController.unblockUser);

export default router;
