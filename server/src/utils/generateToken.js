// Генерация и верификация JWT токенов
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

/**
 * Генерация JWT токена
 * @param {Object} payload - Данные для токена (обычно {id, email, role})
 * @returns {string} - JWT токен
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    algorithm: jwtConfig.algorithm
  });
};

/**
 * Верификация JWT токена
 * @param {string} token - JWT токен
 * @returns {Object} - Декодированные данные
 * @throws {Error} - Если токен невалидный
 */
export const verifyToken = (token) => {
  return jwt.verify(token, jwtConfig.secret);
};

/**
 * Декодирование JWT токена без верификации
 * @param {string} token - JWT токен
 * @returns {Object|null} - Декодированные данные или null
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
