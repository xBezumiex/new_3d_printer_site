// Валидация для поиска
import Joi from 'joi';

// Поиск (общий)
export const searchQuerySchema = Joi.object({
  q: Joi.string().min(1).max(200).required().messages({
    'string.empty': 'Поисковый запрос не может быть пустым',
    'string.min': 'Минимум 1 символ',
    'string.max': 'Максимум 200 символов',
  }),
  type: Joi.string().valid('all', 'posts', 'users').default('all'),
  limit: Joi.number().integer().min(1).max(50).default(10),
});
