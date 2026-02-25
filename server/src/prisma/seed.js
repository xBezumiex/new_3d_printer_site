// Seed данные для тестирования
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Очистка существующих данных (опционально)
  await prisma.lessonProgress.deleteMany();
  await prisma.courseProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.image.deleteMany();
  await prisma.post.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ База данных очищена');

  // Создаем пользователей
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Администратор',
      email: 'admin@3dprint.com',
      password,
      role: 'ADMIN',
      phone: '+7 (999) 123-45-67',
      bio: 'Администратор платформы 3D Print Lab',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'Иван Петров',
      email: 'ivan@example.com',
      password,
      role: 'USER',
      phone: '+7 (999) 111-22-33',
      bio: 'Увлекаюсь 3D-печатью уже 2 года. Люблю печатать модели для дома.',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Мария Смирнова',
      email: 'maria@example.com',
      password,
      role: 'USER',
      phone: '+7 (999) 444-55-66',
      bio: 'Профессиональный дизайнер. Создаю уникальные модели для 3D-печати.',
    },
  });

  console.log('✅ Пользователи созданы');

  // Создаем посты
  const post1 = await prisma.post.create({
    data: {
      title: 'Мой первый 3D-принт: бюст Давида',
      description:
        'Решил напечатать бюст Давида на новом принтере. Использовал PLA пластик, качество HIGH. Результат превзошел все ожидания! Печать заняла 18 часов.',
      user: {
        connect: { id: user1.id },
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Набор кухонных органайзеров',
      description:
        'Разработала и напечатала набор органайзеров для кухни. Материал - PETG для прочности. Очень довольна результатом!',
      user: {
        connect: { id: user2.id },
      },
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Функциональная шестерня для велосипеда',
      description:
        'Сломалась шестерня на велосипеде, решил напечатать замену из нейлона. Протестировал - работает отлично!',
      user: {
        connect: { id: user1.id },
      },
    },
  });

  console.log('✅ Посты созданы');

  // Создаем заказы
  await prisma.order.create({
    data: {
      user: {
        connect: { id: user1.id },
      },
      modelFile: 'https://example.com/models/figurine.stl',
      material: 'PLA',
      quality: 'HIGH',
      infill: 20,
      quantity: 1,
      volume: 125.5,
      weight: 150.0,
      price: 750.0,
      status: 'COMPLETED',
    },
  });

  await prisma.order.create({
    data: {
      user: {
        connect: { id: user2.id },
      },
      modelFile: 'https://example.com/models/vase.stl',
      material: 'PETG',
      quality: 'ULTRA',
      infill: 15,
      quantity: 2,
      volume: 200.0,
      weight: 240.0,
      price: 1440.0,
      status: 'IN_PROGRESS',
    },
  });

  console.log('✅ Заказы созданы');

  // Создаем курсы
  const course1 = await prisma.course.create({
    data: {
      title: 'Основы 3D-печати',
      description:
        'Изучите основы технологии 3D-печати: от выбора принтера до первого успешного принта. Курс подходит для полных новичков.',
      level: 'BEGINNER',
      published: true,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Продвинутые техники 3D-печати',
      description:
        'Освойте сложные техники: многоцветная печать, работа с гибкими материалами, постобработка моделей.',
      level: 'ADVANCED',
      published: true,
    },
  });

  console.log('✅ Курсы созданы');

  // Создаем уроки для курса 1
  await prisma.lesson.create({
    data: {
      courseId: course1.id,
      title: 'Введение в 3D-печать',
      content:
        '3D-печать - это процесс создания трехмерных объектов путем послойного нанесения материала. В этом уроке вы узнаете об основных технологиях 3D-печати и их применении.',
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      courseId: course1.id,
      title: 'Выбор 3D-принтера',
      content:
        'Как выбрать подходящий 3D-принтер для ваших задач? Рассмотрим основные характеристики: область печати, точность, скорость и надежность.',
      order: 2,
    },
  });

  await prisma.lesson.create({
    data: {
      courseId: course1.id,
      title: 'Материалы для 3D-печати',
      content:
        'PLA, ABS, PETG, TPU - какой материал выбрать? Узнайте о свойствах различных филаментов и их применении.',
      order: 3,
    },
  });

  // Создаем уроки для курса 2
  await prisma.lesson.create({
    data: {
      courseId: course2.id,
      title: 'Многоцветная печать',
      content:
        'Техники создания многоцветных моделей: смена филамента, многоэкструдерная печать, постобработка.',
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      courseId: course2.id,
      title: 'Работа с гибкими материалами',
      content:
        'TPU и другие flex-материалы требуют особого подхода. Узнайте о настройках принтера и техниках печати.',
      order: 2,
    },
  });

  console.log('✅ Уроки созданы');

  // Создаем подписки
  await prisma.subscription.create({
    data: {
      subscriber: {
        connect: { id: user1.id },
      },
      subscribedTo: {
        connect: { id: user2.id },
      },
    },
  });

  console.log('✅ Подписки созданы');

  console.log('🎉 База данных успешно заполнена!');
  console.log('\n📋 Тестовые аккаунты:');
  console.log('   Admin: admin@3dprint.com / password123');
  console.log('   User1: ivan@example.com / password123');
  console.log('   User2: maria@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
