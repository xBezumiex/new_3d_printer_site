// Валидация для подписок
import Joi from 'joi';

// Подписка/отписка
export const subscribeSchema = Joi.object({
  subscribedToId: Joi.string().uuid().required().messages({
    'string.guid': 'Некорректный ID пользователя',
    'any.required': 'ID пользователя обязателен',
  }),
});
