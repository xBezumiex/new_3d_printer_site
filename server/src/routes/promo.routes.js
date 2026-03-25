import express from 'express';
import * as c from '../controllers/promo.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/validate', authenticate, c.validatePromo);
router.get('/', authenticate, requireAdmin, c.getPromos);
router.post('/', authenticate, requireAdmin, c.createPromo);
router.put('/:id/toggle', authenticate, requireAdmin, c.togglePromo);
router.delete('/:id', authenticate, requireAdmin, c.deletePromo);

export default router;
