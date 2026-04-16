// Сервис авторизации
import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/generateToken.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';

const PUBLIC_USER_SELECT = {
  id:        true,
  name:      true,
  email:     true,
  phone:     true,
  avatar:    true,
  bio:       true,
  role:      true,
  provider:  true,
  createdAt: true,
};

export const register = async ({ name, email, password, phone }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new ConflictError('Пользователь с таким email уже существует');

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, phone: phone || null, provider: 'local' },
    select: PUBLIC_USER_SELECT,
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return { user, token };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new UnauthorizedError('Неверный email или пароль');

  if (user.provider !== 'local' || !user.password) {
    const providerName = user.provider === 'google' ? 'Google' : 'GitHub';
    throw new UnauthorizedError(`Этот аккаунт привязан к ${providerName}. Войдите через ${providerName}.`);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new UnauthorizedError('Неверный email или пароль');

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

/**
 * Вход/регистрация через OAuth
 * 1. Ищем по provider+providerId
 * 2. Если нет — по email (привязываем к существующему)
 * 3. Если нет — создаём нового
 */
export const loginWithOAuth = async ({ provider, providerId, email, name, avatar }) => {
  // 1. Ищем по provider + providerId
  let user = await prisma.user.findFirst({ where: { provider, providerId } });

  if (user) {
    if (avatar && user.avatar !== avatar) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar },
        select: PUBLIC_USER_SELECT,
      });
    } else {
      const { password: _, ...safe } = user;
      user = safe;
    }
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { user, token };
  }

  // 2. Привязка к существующему аккаунту по email
  if (email) {
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          provider,
          providerId,
          avatar: existingByEmail.avatar || avatar || null,
        },
        select: PUBLIC_USER_SELECT,
      });
      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      return { user, token };
    }
  }

  // 3. Создаём нового пользователя
  user = await prisma.user.create({
    data: {
      name:      name || 'Пользователь',
      email:     email || null,
      password:  null,
      avatar:    avatar || null,
      provider,
      providerId,
    },
    select: PUBLIC_USER_SELECT,
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return { user, token };
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ...PUBLIC_USER_SELECT, updatedAt: true },
  });
  if (!user) throw new NotFoundError('Пользователь не найден');
  return user;
};

export const updateProfile = async (userId, data) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { ...PUBLIC_USER_SELECT, updatedAt: true },
  });
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('Пользователь не найден');

  // OAuth-пользователь без пароля — устанавливает пароль впервые
  if (!user.password) {
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
    return { message: 'Пароль успешно установлен' };
  }

  const isPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isPasswordValid) throw new UnauthorizedError('Неверный текущий пароль');

  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
  return { message: 'Пароль успешно изменён' };
};
