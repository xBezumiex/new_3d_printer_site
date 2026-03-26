// Точка входа сервера
import dotenv from 'dotenv';
import { exec } from 'child_process';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Сначала запускаем сервер — Render health check должен пройти немедленно
const server = app.listen(PORT, () => {
  console.log('🚀 ==========================================');
  console.log(`🚀 3D Print Lab API запущен на порту ${PORT}`);
  console.log(`🚀 Окружение: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ==========================================');

  // db push запускаем в фоне ПОСЛЕ старта, чтобы не блокировать health check
  exec('npx prisma db push --skip-generate --accept-data-loss', (err) => {
    if (err) console.warn('⚠️  db push warning:', err.message);
    else console.log('✅ Database schema synced');
  });
});

process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  server.close(() => console.log('💤 Process terminated'));
});
