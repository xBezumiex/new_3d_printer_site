// Роуты для работы с пользователями
import express from 'express';
import * as usersController from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateProfileSchema, getUsersQuerySchema } from '../validators/users.validator.js';

const router = express.Router();

// Публичные роуты
router.get('/', validate(getUsersQuerySchema, 'query'), usersController.getUsers);
router.get('/:id', usersController.getUserById);
router.get('/:id/posts', usersController.getUserPosts);

// Защищенные роуты
router.put(
  '/:id',
  authenticate,
  validate(updateProfileSchema),
  usersController.updateUserProfile
);

export default router;
