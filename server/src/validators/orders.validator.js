// Валидация данных заказов
import Joi from 'joi';

// Схема создания заказа
export const createOrderSchema = Joi.object({
  // Параметры модели
  modelFile: Joi.string()
    .max(500)
    .allow('', null),

  material: Joi.string()
    .valid('PLA', 'ABS', 'PETG', 'TPU', 'NYLON')
    .default('PLA')
    .messages({
      'any.only': 'Материал должен быть одним из: PLA, ABS, PETG, TPU, NYLON'
    }),

  quality: Joi.string()
    .valid('DRAFT', 'STANDARD', 'HIGH', 'ULTRA')
    .default('STANDARD')
    .messages({
      'any.only': 'Качество должно быть одним из: DRAFT, STANDARD, HIGH, ULTRA'
    }),

  infill: Joi.number()
    .integer()
    .min(10)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Заполнение должно быть числом',
      'number.min': 'Заполнение не может быть меньше 10%',
      'number.max': 'Заполнение не может быть больше 100%'
    }),

  quantity: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(1)
    .messages({
      'number.base': 'Количество должно быть числом',
      'number.min': 'Количество не может быть меньше 1',
      'number.max': 'Количество не может быть больше 100'
    }),

  volume: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Объем должен быть числом',
      'number.positive': 'Объем должен быть положительным',
      'any.required': 'Объем обязателен'
    }),

  weight: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Вес должен быть числом',
      'number.positive': 'Вес должен быть положительным',
      'any.required': 'Вес обязателен'
    }),

  price: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Цена должна быть числом',
      'number.positive': 'Цена должна быть положительной',
      'any.required': 'Цена обязательна'
    }),

  comments: Joi.string()
    .max(1000)
    .allow('', null)
    .messages({
      'string.max': 'Комментарий не может превышать 1000 символов'
    })
});

// Схема обновления статуса заказа (только для админа)
export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    .required()
    .messages({
      'any.only': 'Статус должен быть одним из: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED',
      'any.required': 'Статус обязателен'
    })
});

// Схема фильтров для списка заказов
export const getOrdersQuerySchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    .messages({
      'any.only': 'Статус должен быть одним из: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Страница должна быть числом',
      'number.min': 'Страница не может быть меньше 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Лимит должен быть числом',
      'number.min': 'Лимит не может быть меньше 1',
      'number.max': 'Лимит не может быть больше 100'
    }),

  sortBy: Joi.string()
    .valid('createdAt', 'price', 'status')
    .default('createdAt')
    .messages({
      'any.only': 'Сортировка доступна по: createdAt, price, status'
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Порядок сортировки должен быть: asc или desc'
    })
});
