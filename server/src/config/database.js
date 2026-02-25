// Конфигурация базы данных (Prisma)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Обработка закрытия соединения
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
