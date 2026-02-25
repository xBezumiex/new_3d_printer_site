// Сервис для работы с Cloudinary
import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/errors.js';

/**
 * Загрузка изображения в Cloudinary
 * @param {string} filePath - Путь к файлу или base64 строка
 * @param {string} folder - Папка в Cloudinary
 * @param {Object} options - Дополнительные опции
 * @returns {Promise<Object>} - Результат загрузки
 */
export const uploadImage = async (filePath, folder = '3d-print-lab', options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      ...options
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Ошибка загрузки в Cloudinary:', error);
    throw new AppError('Ошибка загрузки изображения', 500);
  }
};

/**
 * Загрузка 3D модели в Cloudinary
 * @param {string} filePath - Путь к файлу
 * @param {string} folder - Папка в Cloudinary
 * @returns {Promise<Object>} - Результат загрузки
 */
export const uploadModel = async (filePath, folder = '3d-print-lab/models') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'raw', // Для 3D файлов
      format: 'stl' // или автоопределение
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Ошибка загрузки модели в Cloudinary:', error);
    throw new AppError('Ошибка загрузки 3D модели', 500);
  }
};

/**
 * Удаление файла из Cloudinary
 * @param {string} publicId - Public ID файла в Cloudinary
 * @param {string} resourceType - Тип ресурса ('image', 'raw', 'video')
 * @returns {Promise<Object>} - Результат удаления
 */
export const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    return result;
  } catch (error) {
    console.error('Ошибка удаления из Cloudinary:', error);
    throw new AppError('Ошибка удаления файла', 500);
  }
};

/**
 * Загрузка нескольких изображений
 * @param {Array} files - Массив файлов
 * @param {string} folder - Папка в Cloudinary
 * @returns {Promise<Array>} - Массив результатов
 */
export const uploadMultipleImages = async (files, folder = '3d-print-lab') => {
  try {
    const uploadPromises = files.map(file => uploadImage(file.path, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Ошибка загрузки нескольких изображений:', error);
    throw new AppError('Ошибка загрузки изображений', 500);
  }
};
