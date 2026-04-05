// Отдача изображений из PostgreSQL
import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

// GET /api/images/:id
router.get('/:id', async (req, res) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT data, mime_type FROM "image_data" WHERE id = ${req.params.id} LIMIT 1
    `;
    if (!rows.length || !rows[0].data) return res.status(404).send('Not found');

    const buffer = Buffer.from(rows[0].data, 'base64');
    res.setHeader('Content-Type', rows[0].mime_type || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    res.send(buffer);
  } catch {
    res.status(404).send('Not found');
  }
});

export default router;
