// Роуты для курсов
import express from 'express';
import * as coursesController from '../controllers/courses.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createCourseSchema,
  updateCourseSchema,
  createLessonSchema,
  updateLessonSchema,
} from '../validators/courses.validator.js';

const router = express.Router();

// ========== КУРСЫ (публичные) ==========

// Получить список курсов
router.get('/', coursesController.getCourses);

// Получить курс по ID
router.get('/:id', coursesController.getCourseById);

// Получить уроки курса
router.get('/:courseId/lessons', coursesController.getLessons);

// Получить урок по ID
router.get('/lessons/:lessonId', coursesController.getLessonById);

// ========== КУРСЫ (защищенные) ==========

// Создать курс (только админ)
router.post('/', authenticate, validate(createCourseSchema), coursesController.createCourse);

// Обновить курс (только админ)
router.put('/:id', authenticate, validate(updateCourseSchema), coursesController.updateCourse);

// Удалить курс (только админ)
router.delete('/:id', authenticate, coursesController.deleteCourse);

// Создать урок (только админ)
router.post(
  '/:courseId/lessons',
  authenticate,
  validate(createLessonSchema),
  coursesController.createLesson
);

// Обновить урок (только админ)
router.put(
  '/lessons/:lessonId',
  authenticate,
  validate(updateLessonSchema),
  coursesController.updateLesson
);

// Удалить урок (только админ)
router.delete('/lessons/:lessonId', authenticate, coursesController.deleteLesson);

// ========== ПРОГРЕСС ==========

// Записаться на курс
router.post('/:courseId/enroll', authenticate, coursesController.enrollCourse);

// Получить прогресс по курсу
router.get('/:courseId/progress', authenticate, coursesController.getCourseProgress);

// Отметить урок как пройденный
router.post('/lessons/:lessonId/complete', authenticate, coursesController.completeLesson);

// Получить курсы пользователя
router.get('/user/my-courses', authenticate, coursesController.getUserCourses);

export default router;
