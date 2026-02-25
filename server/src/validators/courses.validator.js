// Валидация для курсов
import Joi from 'joi';

// Создание курса
export const createCourseSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Название должно содержать минимум 3 символа',
    'string.max': 'Название не должно превышать 200 символов',
    'any.required': 'Название обязательно',
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    'string.min': 'Описание должно содержать минимум 10 символов',
    'string.max': 'Описание не должно превышать 2000 символов',
    'any.required': 'Описание обязательно',
  }),
  thumbnail: Joi.string().uri().allow('').messages({
    'string.uri': 'Некорректный URL изображения',
  }),
  level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').default('BEGINNER'),
  published: Joi.boolean().default(false),
});

// Обновление курса
export const updateCourseSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  description: Joi.string().min(10).max(2000),
  thumbnail: Joi.string().uri().allow(''),
  level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
  published: Joi.boolean(),
}).min(1);

// Создание урока
export const createLessonSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Название должно содержать минимум 3 символа',
    'string.max': 'Название не должно превышать 200 символов',
    'any.required': 'Название обязательно',
  }),
  content: Joi.string().min(10).max(10000).required().messages({
    'string.min': 'Содержание должно содержать минимум 10 символов',
    'string.max': 'Содержание не должно превышать 10000 символов',
    'any.required': 'Содержание обязательно',
  }),
  videoUrl: Joi.string().uri().allow('').messages({
    'string.uri': 'Некорректный URL видео',
  }),
  order: Joi.number().integer().min(0).default(0),
});

// Обновление урока
export const updateLessonSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  content: Joi.string().min(10).max(10000),
  videoUrl: Joi.string().uri().allow(''),
  order: Joi.number().integer().min(0),
}).min(1);
