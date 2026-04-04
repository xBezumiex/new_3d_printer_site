// Сервис для работы с Cloudinary
import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/errors.js';

/**
 * Загрузить изображение из Buffer в Cloudinary
 * @param {Buffer} buffer - Буфер файла (из multer memoryStorage)
 * @param {string} mimeType - MIME-тип ('image/jpeg', 'image/png' и т.д.)
 * @param {string} folder - Папка в Cloudinary
 * @param {Object} options - Дополнительные опции
 */
export const uploadImageBuffer = async (buffer, mimeType, folder = '3d-print-lab/images', options = {}) => {
  try {
    const base64 = buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
      ...options,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new AppError('Ошибка загрузки изображения в Cloudinary', 500);
  }
};

/**
 * Удалить файл из Cloudinary по publicId
 */
export const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new AppError('Ошибка удаления файла из Cloudinary', 500);
  }
};

/**
 * Загрузить несколько изображений из массива файлов multer
 */
export const uploadMultipleBuffers = async (files, folder = '3d-print-lab/images') => {
  return Promise.all(
    files.map(file => uploadImageBuffer(file.buffer, file.mimetype, folder))
  );
};
