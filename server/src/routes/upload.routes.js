// Загрузка изображений через Cloudinary
import express from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadImageBuffer, uploadMultipleBuffers } from '../services/cloudinary.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Только изображения (JPEG, PNG, GIF, WebP)'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const router = express.Router();

// POST /api/upload/image — одно изображение
router.post('/image', authenticate, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ status: 'fail', message: 'Файл не загружен' });

  const result = await uploadImageBuffer(req.file.buffer, req.file.mimetype, '3d-print-lab/images');

  res.json({
    status: 'success',
    data: {
      url: result.url,
      publicId: result.publicId,
      originalName: req.file.originalname,
      size: req.file.size,
    },
  });
}));

// POST /api/upload/images — несколько изображений
router.post('/images', authenticate, upload.array('images', 10), asyncHandler(async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ status: 'fail', message: 'Файлы не загружены' });

  const results = await uploadMultipleBuffers(req.files, '3d-print-lab/images');
  const urls = results.map(r => r.url);

  res.json({ status: 'success', data: { urls } });
}));

export default router;
