// Сервис авторизации
import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/generateToken.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';

/**
 * Регистрация нового пользователя
 */
export const register = async ({ name, email, password, phone }) => {
  // Проверка существования пользователя
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ConflictError('Пользователь с таким email уже существует');
  }

  // Хеширование пароля
  const hashedPassword = await hashPassword(password);

  // Создание пользователя
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: phone || null
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true
    }
  });

  // Генерация токена
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return { user, token };
};

/**
 * Логин пользователя
 */
export const login = async ({ email, password }) => {
  // Поиск пользователя
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new UnauthorizedError('Неверный email или пароль');
  }

  // Проверка пароля
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Неверный email или пароль');
  }

  // Генерация токена
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  // Удаление пароля из ответа
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

/**
 * Получение текущего пользователя по ID
 */
export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      bio: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  return user;
};

/**
 * Обновление профиля пользователя
 */
export const updateProfile = async (userId, data) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      bio: true,
      role: true,
      updatedAt: true
    }
  });

  return user;
};

/**
 * Изменение пароля
 */
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  // Получение пользователя с паролем
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new NotFoundError('Пользователь не найден');
  }

  // Проверка текущего пароля
  const isPasswordValid = await comparePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Неверный текущий пароль');
  }

  // Хеширование нового пароля
  const hashedPassword = await hashPassword(newPassword);

  // Обновление пароля
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  return { message: 'Пароль успешно изменён' };
};
