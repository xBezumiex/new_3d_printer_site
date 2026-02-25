// Middleware для валидации данных
import { ValidationError } from '../utils/errors.js';

/**
 * Middleware для валидации данных с помощью Joi
 * @param {Object} schema - Joi схема валидации
 * @returns {Function} - Express middleware
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Показать все ошибки, а не только первую
      stripUnknown: true // Удалить неизвестные поля
    });

    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new ValidationError(message));
    }

    // Заменить req.body на валидированные данные
    req.body = value;
    next();
  };
};
