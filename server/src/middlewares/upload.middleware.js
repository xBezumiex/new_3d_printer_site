// Middleware для загрузки файлов (Multer)
import multer from 'multer';
import path from 'path';
import { AppError } from '../utils/errors.js';

// Настройка хранилища (в памяти для Cloudinary)
const storage = multer.memoryStorage();

// Фильтр для изображений
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new AppError('Только изображения (jpeg, jpg, png, gif, webp)', 400));
  }
};

// Фильтр для 3D моделей
const modelFilter = (req, file, cb) => {
  const allowedTypes = /stl|obj|ply|gltf|glb/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new AppError('Только 3D модели (stl, obj, ply, gltf, glb)', 400));
  }
};

// Middleware для загрузки одного изображения
export const uploadSingleImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single('image');

// Middleware для загрузки нескольких изображений
export const uploadMultipleImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB на файл
  }
}).array('images', 10); // Максимум 10 изображений

// Middleware для загрузки 3D модели
export const uploadModel = multer({
  storage,
  fileFilter: modelFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
}).single('model');

// Обработка ошибок Multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Файл слишком большой', 400));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Неожиданное поле файла', 400));
    }
    return next(new AppError(err.message, 400));
  }
  next(err);
};
