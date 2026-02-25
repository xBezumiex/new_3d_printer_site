// Сервис для курсов
import prisma from '../config/database.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';

// ========== КУРСЫ ==========

// Получение списка курсов
export const getCourses = async (query = {}) => {
  const { published, level } = query;

  const where = {};

  if (published !== undefined) {
    where.published = published === 'true';
  }

  if (level) {
    where.level = level;
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          lessons: true,
          progress: true,
        },
      },
    },
  });

  return courses;
};

// Получение курса по ID
export const getCourseById = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      _count: {
        select: {
          lessons: true,
          progress: true,
        },
      },
    },
  });

  if (!course) {
    throw new NotFoundError('Курс не найден');
  }

  return course;
};

// Создание курса (только админ)
export const createCourse = async (userRole, courseData) => {
  if (userRole !== 'ADMIN') {
    throw new ForbiddenError('Только администраторы могут создавать курсы');
  }

  const course = await prisma.course.create({
    data: courseData,
  });

  return course;
};

// Обновление курса (только админ)
export const updateCourse = async (courseId, userRole, updateData) => {
  if (userRole !== 'ADMIN') {
    throw new ForbiddenError('Только администраторы могут редактировать курсы');
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new NotFoundError('Курс не найден');
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: updateData,
  });

  return updatedCourse;
};

// Удаление курса (только админ)
export const deleteCourse = async (courseId, userRole) => {
  if (userRole !== 'ADMIN') {
    throw new ForbiddenError('Только администраторы могут удалять курсы');
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new NotFoundError('Курс не найден');
  }

  await prisma.course.delete({
    where: { id: courseId },
  });

  return { message: 'Курс удален' };
};

// ========== УРОКИ ==========

// Получение уроков курса
export const getLessons = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new NotFoundError('Курс не найден');
  }

  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
  });

  return lessons;
};

// Получение урока по ID
export const getLessonById = async (lessonId) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          level: true,
        },
      },
    },
  });

  if (!lesson) {
    throw new NotFoundError('Урок не найден');
  }

  return lesson;
};

// Создание урока (только админ)
export const createLesson = async (courseId, userRole, lessonData) => {
  if (userRole !== 'ADMIN') {
    throw new ForbiddenError('Только администраторы могут создавать уроки');
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new NotFoundError('Курс не найден');
  }

  const lesson = await prisma.lesson.create({
    data: {
      ...lessonData,
      courseId,
    },
  });

  return lesson;
};

// Обновление урока (только админ)
export const updateLesson = async (lessonId, userRole, updateData) => {
  if (userRole !== 'ADMIN') {
    throw new ForbiddenError('Только администраторы могут редактировать уроки');
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    throw new NotFoundError('Урок не найден');
  }

  const updatedLesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: updateData,
  });

  return updatedLesson;
};

// Удаление урока (только админ)
export const deleteLesson = async (lessonId, userRole) => {
  if (userRole !== 'ADMIN') {
    throw new ForbiddenError('Только администраторы могут удалять уроки');
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    throw new NotFoundError('Урок не найден');
  }

  await prisma.lesson.delete({
    where: { id: lessonId },
  });

  return { message: 'Урок удален' };
};

// ========== ПРОГРЕСС ==========

// Записаться на курс
export const enrollCourse = async (userId, courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new NotFoundError('Курс не найден');
  }

  if (!course.published) {
    throw new BadRequestError('Курс еще не опубликован');
  }

  // Проверка: уже записан?
  const existingProgress = await prisma.courseProgress.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingProgress) {
    throw new BadRequestError('Вы уже записаны на этот курс');
  }

  // Создать прогресс
  const progress = await prisma.courseProgress.create({
    data: {
      userId,
      courseId,
      completed: false,
    },
    include: {
      course: true,
    },
  });

  return progress;
};

// Получить прогресс пользователя по курсу
export const getCourseProgress = async (userId, courseId) => {
  const progress = await prisma.courseProgress.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    include: {
      course: true,
      lessonProgress: {
        include: {
          lesson: true,
        },
      },
    },
  });

  if (!progress) {
    throw new NotFoundError('Вы не записаны на этот курс');
  }

  return progress;
};

// Отметить урок как пройденный
export const completeLesson = async (userId, lessonId) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });

  if (!lesson) {
    throw new NotFoundError('Урок не найден');
  }

  // Найти прогресс курса
  const courseProgress = await prisma.courseProgress.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: lesson.courseId,
      },
    },
  });

  if (!courseProgress) {
    throw new BadRequestError('Вы не записаны на этот курс');
  }

  // Проверка: урок уже пройден?
  const existingLessonProgress = await prisma.lessonProgress.findUnique({
    where: {
      courseProgressId_lessonId: {
        courseProgressId: courseProgress.id,
        lessonId,
      },
    },
  });

  if (existingLessonProgress) {
    throw new BadRequestError('Урок уже отмечен как пройденный');
  }

  // Отметить урок как пройденный
  const lessonProgress = await prisma.lessonProgress.create({
    data: {
      courseProgressId: courseProgress.id,
      lessonId,
      completed: true,
    },
  });

  // Проверить: все уроки пройдены?
  const totalLessons = await prisma.lesson.count({
    where: { courseId: lesson.courseId },
  });

  const completedLessons = await prisma.lessonProgress.count({
    where: {
      courseProgressId: courseProgress.id,
      completed: true,
    },
  });

  // Если все уроки пройдены, отметить курс как завершенный
  if (completedLessons === totalLessons) {
    await prisma.courseProgress.update({
      where: { id: courseProgress.id },
      data: { completed: true },
    });
  }

  return lessonProgress;
};

// Получить курсы пользователя (в которых он записан)
export const getUserCourses = async (userId) => {
  const progresses = await prisma.courseProgress.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
      lessonProgress: {
        where: { completed: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return progresses.map((progress) => ({
    ...progress.course,
    progress: {
      completed: progress.completed,
      completedLessons: progress.lessonProgress.length,
      totalLessons: progress.course._count.lessons,
      enrolledAt: progress.createdAt,
    },
  }));
};
