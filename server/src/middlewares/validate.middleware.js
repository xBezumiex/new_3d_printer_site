// Middleware для валидации данных
import { ValidationError } from '../utils/errors.js';

/**
 * Middleware для валидации данных с помощью Joi
 * @param {Object} schema - Joi схема валидации
 * @returns {Function} - Express middleware
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : req.body;
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new ValidationError(message));
    }

    if (source === 'query') {
      req.query = value;
    } else {
      req.body = value;
    }
    next();
  };
};
