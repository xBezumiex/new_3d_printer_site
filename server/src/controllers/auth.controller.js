// Контроллер авторизации
import * as authService from '../services/auth.service.js';

/**
 * Регистрация пользователя
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Логин пользователя
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Успешный вход',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получение текущего пользователя
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Обновление профиля
 * PUT /api/auth/me
 */
export const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Профиль успешно обновлён',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Изменение пароля
 * PUT /api/auth/password
 */
export const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Логаут (клиентская сторона удаляет токен)
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Успешный выход'
    });
  } catch (error) {
    next(error);
  }
};
