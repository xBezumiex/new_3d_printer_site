// Валидация данных для пользователей
import Joi from 'joi';

// Обновление профиля пользователя
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).messages({
    'string.min': 'Имя должно содержать минимум 2 символа',
    'string.max': 'Имя не должно превышать 100 символов',
  }),
  phone: Joi.string()
    .pattern(/^[\d\s\-\+\(\)]+$/)
    .messages({
      'string.pattern.base': 'Некорректный номер телефона',
    }),
  bio: Joi.string().max(500).allow('').messages({
    'string.max': 'Биография не должна превышать 500 символов',
  }),
  avatar: Joi.string().uri().allow('').messages({
    'string.uri': 'Некорректный URL аватара',
  }),
}).min(1);

// Параметры запроса для получения списка пользователей
export const getUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(200),
});
