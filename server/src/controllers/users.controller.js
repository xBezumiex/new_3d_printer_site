// Контроллеры для работы с пользователями
import * as usersService from '../services/users.service.js';
import asyncHandler from '../utils/asyncHandler.js';

// Получение списка пользователей
export const getUsers = asyncHandler(async (req, res) => {
  const result = await usersService.getUsers(req.query);

  res.json({
    status: 'success',
    data: result,
  });
});

// Получение пользователя по ID
export const getUserById = asyncHandler(async (req, res) => {
  const user = await usersService.getUserById(req.params.id);

  res.json({
    status: 'success',
    data: { user },
  });
});

// Обновление профиля пользователя
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await usersService.updateUserProfile(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body
  );

  res.json({
    status: 'success',
    data: { user },
  });
});

// Получение постов пользователя
export const getUserPosts = asyncHandler(async (req, res) => {
  const result = await usersService.getUserPosts(req.params.id, req.query);

  res.json({
    status: 'success',
    data: result,
  });
});
