// Конфигурация JWT
export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  algorithm: 'HS256'
};
