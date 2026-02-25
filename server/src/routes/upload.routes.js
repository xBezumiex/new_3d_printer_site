// Маршруты для загрузки файлов
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { authenticate } from '../middlewares/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Директория для загрузок
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Допустимы только изображения (JPEG, PNG, GIF, WebP)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const router = express.Router();

// Загрузка одного изображения
router.post(
  '/image',
  authenticate,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Файл не загружен',
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      status: 'success',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  })
);

// Загрузка нескольких изображений (до 10)
router.post(
  '/images',
  authenticate,
  upload.array('images', 10),
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Файлы не загружены',
      });
    }

    const urls = req.files.map((file) => `/uploads/${file.filename}`);

    res.json({
      status: 'success',
      data: { urls },
    });
  })
);

export default router;
