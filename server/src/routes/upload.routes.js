// Загрузка изображений — хранение в PostgreSQL (data column)
import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Только изображения (JPEG, PNG, GIF, WebP)'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Сохранить изображение в image_data таблицу через raw SQL
async function saveImageToDb(buffer, mimeType) {
  const id = crypto.randomUUID();
  const b64 = buffer.toString('base64');
  await prisma.$executeRaw`
    INSERT INTO image_data (id, data, mime_type)
    VALUES (${id}, ${b64}, ${mimeType})
  `;
  return id;
}

const router = express.Router();

// POST /api/upload/image
router.post('/image', authenticate, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ status: 'fail', message: 'Файл не загружен' });
  const id = await saveImageToDb(req.file.buffer, req.file.mimetype);
  res.json({ status: 'success', data: { url: `/api/images/${id}`, originalName: req.file.originalname, size: req.file.size } });
}));

// POST /api/upload/images
router.post('/images', authenticate, upload.array('images', 10), asyncHandler(async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ status: 'fail', message: 'Файлы не загружены' });
  const urls = await Promise.all(req.files.map(async f => {
    const id = await saveImageToDb(f.buffer, f.mimetype);
    return `/img/${id}`;
  }));
  res.json({ status: 'success', data: { urls } });
}));

export default router;
