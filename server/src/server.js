// Точка входа сервера
import dotenv from 'dotenv';
import app from './app.js';

// Загрузка переменных окружения
dotenv.config();

const PORT = process.env.PORT || 5000;

// Запуск сервера
const server = app.listen(PORT, () => {
  console.log('🚀 ==========================================');
  console.log(`🚀 3D Print Lab API запущен на порту ${PORT}`);
  console.log(`🚀 Окружение: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 URL: http://localhost:${PORT}`);
  console.log('🚀 ==========================================');
});

// Обработка необработанных промисов
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('💤 Process terminated!');
  });
});
