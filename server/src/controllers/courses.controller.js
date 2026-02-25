// Контроллеры для курсов
import * as coursesService from '../services/courses.service.js';
import asyncHandler from '../utils/asyncHandler.js';

// ========== КУРСЫ ==========

// Получить список курсов
export const getCourses = asyncHandler(async (req, res) => {
  const courses = await coursesService.getCourses(req.query);

  res.json({
    status: 'success',
    data: { courses },
  });
});

// Получить курс по ID
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await coursesService.getCourseById(req.params.id);

  res.json({
    status: 'success',
    data: { course },
  });
});

// Создать курс (только админ)
export const createCourse = asyncHandler(async (req, res) => {
  const course = await coursesService.createCourse(req.user.role, req.body);

  res.status(201).json({
    status: 'success',
    data: { course },
  });
});

// Обновить курс (только админ)
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await coursesService.updateCourse(req.params.id, req.user.role, req.body);

  res.json({
    status: 'success',
    data: { course },
  });
});

// Удалить курс (только админ)
export const deleteCourse = asyncHandler(async (req, res) => {
  const result = await coursesService.deleteCourse(req.params.id, req.user.role);

  res.json({
    status: 'success',
    data: result,
  });
});

// ========== УРОКИ ==========

// Получить уроки курса
export const getLessons = asyncHandler(async (req, res) => {
  const lessons = await coursesService.getLessons(req.params.courseId);

  res.json({
    status: 'success',
    data: { lessons },
  });
});

// Получить урок по ID
export const getLessonById = asyncHandler(async (req, res) => {
  const lesson = await coursesService.getLessonById(req.params.lessonId);

  res.json({
    status: 'success',
    data: { lesson },
  });
});

// Создать урок (только админ)
export const createLesson = asyncHandler(async (req, res) => {
  const lesson = await coursesService.createLesson(req.params.courseId, req.user.role, req.body);

  res.status(201).json({
    status: 'success',
    data: { lesson },
  });
});

// Обновить урок (только админ)
export const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await coursesService.updateLesson(req.params.lessonId, req.user.role, req.body);

  res.json({
    status: 'success',
    data: { lesson },
  });
});

// Удалить урок (только админ)
export const deleteLesson = asyncHandler(async (req, res) => {
  const result = await coursesService.deleteLesson(req.params.lessonId, req.user.role);

  res.json({
    status: 'success',
    data: result,
  });
});

// ========== ПРОГРЕСС ==========

// Записаться на курс
export const enrollCourse = asyncHandler(async (req, res) => {
  const progress = await coursesService.enrollCourse(req.user.id, req.params.courseId);

  res.status(201).json({
    status: 'success',
    data: { progress },
  });
});

// Получить прогресс по курсу
export const getCourseProgress = asyncHandler(async (req, res) => {
  const progress = await coursesService.getCourseProgress(req.user.id, req.params.courseId);

  res.json({
    status: 'success',
    data: { progress },
  });
});

// Отметить урок как пройденный
export const completeLesson = asyncHandler(async (req, res) => {
  const lessonProgress = await coursesService.completeLesson(req.user.id, req.params.lessonId);

  res.json({
    status: 'success',
    data: { lessonProgress },
  });
});

// Получить курсы пользователя
export const getUserCourses = asyncHandler(async (req, res) => {
  const courses = await coursesService.getUserCourses(req.user.id);

  res.json({
    status: 'success',
    data: { courses },
  });
});
