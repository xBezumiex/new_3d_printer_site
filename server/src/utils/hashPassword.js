// Утилиты для работы с паролями
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Хеширование пароля
 * @param {string} password - Пароль в открытом виде
 * @returns {Promise<string>} - Хешированный пароль
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Сравнение пароля с хешем
 * @param {string} password - Пароль в открытом виде
 * @param {string} hash - Хешированный пароль
 * @returns {Promise<boolean>} - Совпадение
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
