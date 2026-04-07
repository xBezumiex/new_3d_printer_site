// Отдача изображений из PostgreSQL
import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

// Прозрачный 1×1 PNG — возвращается вместо 404, чтобы не засорять консоль браузера
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

// GET /api/images/:id
router.get('/:id', async (req, res) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT data, mime_type FROM "image_data" WHERE id = ${req.params.id} LIMIT 1
    `;

    if (!rows.length || !rows[0].data) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.status(200).send(TRANSPARENT_PNG);
    }

    const buffer = Buffer.from(rows[0].data, 'base64');
    res.setHeader('Content-Type', rows[0].mime_type || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    res.send(buffer);
  } catch {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.status(200).send(TRANSPARENT_PNG);
  }
});

export default router;
