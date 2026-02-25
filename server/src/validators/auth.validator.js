// Валидация данных авторизации с помощью Joi
import Joi from 'joi';

// Схема регистрации
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Имя обязательно',
      'string.min': 'Имя должно содержать минимум 2 символа',
      'string.max': 'Имя не может превышать 100 символов'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email обязателен',
      'string.email': 'Некорректный email адрес'
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Пароль обязателен',
      'string.min': 'Пароль должен содержать минимум 6 символов'
    }),

  phone: Joi.string()
    .pattern(/^[\d\s\+\-\(\)]+$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Некорректный формат телефона'
    })
});

// Схема логина
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email обязателен',
      'string.email': 'Некорректный email адрес'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Пароль обязателен'
    })
});

// Схема обновления профиля
export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Имя должно содержать минимум 2 символа',
      'string.max': 'Имя не может превышать 100 символов'
    }),

  phone: Joi.string()
    .pattern(/^[\d\s\+\-\(\)]+$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Некорректный формат телефона'
    }),

  bio: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Биография не может превышать 500 символов'
    })
});

// Схема изменения пароля
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Текущий пароль обязателен'
    }),

  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Новый пароль обязателен',
      'string.min': 'Новый пароль должен содержать минимум 6 символов'
    })
});
