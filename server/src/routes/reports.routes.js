import express from 'express';
import * as c from '../controllers/reports.controller.js';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, c.createReport);
router.get('/', authenticate, requireAdmin, c.getReports);
router.put('/:id', authenticate, requireAdmin, c.updateReportStatus);

export default router;
