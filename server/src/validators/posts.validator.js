// Валидация данных для постов
import Joi from 'joi';

// Создание поста
export const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.empty': 'Заголовок обязателен',
    'string.min': 'Заголовок должен содержать минимум 3 символа',
    'string.max': 'Заголовок не должен превышать 200 символов',
  }),
  description: Joi.string().min(10).max(5000).required().messages({
    'string.empty': 'Содержание обязательно',
    'string.min': 'Содержание должно содержать минимум 10 символов',
    'string.max': 'Содержание не должно превышать 5000 символов',
  }),
  // images - массив URL изображений (загружаются отдельно через Cloudinary)
});

// Обновление поста
export const updatePostSchema = Joi.object({
  title: Joi.string().min(3).max(200).messages({
    'string.min': 'Заголовок должен содержать минимум 3 символа',
    'string.max': 'Заголовок не должен превышать 200 символов',
  }),
  description: Joi.string().min(10).max(5000).messages({
    'string.min': 'Содержание должно содержать минимум 10 символов',
    'string.max': 'Содержание не должно превышать 5000 символов',
  }),
}).min(1);

// Параметры запроса для получения списка постов
export const getPostsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  userId: Joi.string().uuid(),
  search: Joi.string().max(200),
});
