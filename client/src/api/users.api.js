// API для работы с пользователями
import axiosInstance from './axios';

// Получить список пользователей
export const getUsers = (params = {}) => {
  return axiosInstance.get('/users', { params });
};

// Получить пользователя по ID
export const getUserById = (userId) => {
  return axiosInstance.get(`/users/${userId}`);
};

// Обновить профиль пользователя
export const updateUserProfile = (userId, data) => {
  return axiosInstance.put(`/users/${userId}`, data);
};

// Получить посты пользователя
export const getUserPosts = (userId, params = {}) => {
  return axiosInstance.get(`/users/${userId}/posts`, { params });
};

// Поиск пользователей
export const searchUsers = (query) => {
  return axiosInstance.get('/users', { params: { search: query } });
};
