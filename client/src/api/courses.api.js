// API для курсов
import axiosInstance from './axios';

// ========== КУРСЫ ==========

// Получить список курсов
export const getCourses = (params = {}) => {
  return axiosInstance.get('/courses', { params });
};

// Получить курс по ID
export const getCourseById = (courseId) => {
  return axiosInstance.get(`/courses/${courseId}`);
};

// Создать курс (только админ)
export const createCourse = (data) => {
  return axiosInstance.post('/courses', data);
};

// Обновить курс (только админ)
export const updateCourse = (courseId, data) => {
  return axiosInstance.put(`/courses/${courseId}`, data);
};

// Удалить курс (только админ)
export const deleteCourse = (courseId) => {
  return axiosInstance.delete(`/courses/${courseId}`);
};

// ========== УРОКИ ==========

// Получить уроки курса
export const getLessons = (courseId) => {
  return axiosInstance.get(`/courses/${courseId}/lessons`);
};

// Получить урок по ID
export const getLessonById = (lessonId) => {
  return axiosInstance.get(`/courses/lessons/${lessonId}`);
};

// Создать урок (только админ)
export const createLesson = (courseId, data) => {
  return axiosInstance.post(`/courses/${courseId}/lessons`, data);
};

// Обновить урок (только админ)
export const updateLesson = (lessonId, data) => {
  return axiosInstance.put(`/courses/lessons/${lessonId}`, data);
};

// Удалить урок (только админ)
export const deleteLesson = (lessonId) => {
  return axiosInstance.delete(`/courses/lessons/${lessonId}`);
};

// ========== ПРОГРЕСС ==========

// Записаться на курс
export const enrollCourse = (courseId) => {
  return axiosInstance.post(`/courses/${courseId}/enroll`);
};

// Получить прогресс по курсу
export const getCourseProgress = (courseId) => {
  return axiosInstance.get(`/courses/${courseId}/progress`);
};

// Отметить урок как пройденный
export const completeLesson = (lessonId) => {
  return axiosInstance.post(`/courses/lessons/${lessonId}/complete`);
};

// Получить мои курсы
export const getMyCourses = () => {
  return axiosInstance.get('/courses/user/my-courses');
};
