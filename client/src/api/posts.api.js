// API клиент для постов
import axiosInstance from './axios';

// Получить список постов (с пагинацией и фильтрами)
export const getPosts = (params = {}) => {
  return axiosInstance.get('/posts', { params });
};

// Получить пост по ID
export const getPostById = (postId) => {
  return axiosInstance.get(`/posts/${postId}`);
};

// Создать пост
export const createPost = (postData) => {
  return axiosInstance.post('/posts', postData);
};

// Обновить пост
export const updatePost = (postId, postData) => {
  return axiosInstance.put(`/posts/${postId}`, postData);
};

// Удалить пост
export const deletePost = (postId) => {
  return axiosInstance.delete(`/posts/${postId}`);
};

// Добавить изображения к посту
export const addImagesToPost = (postId, imageUrls) => {
  return axiosInstance.post(`/posts/${postId}/images`, { imageUrls });
};

// Удалить изображение из поста
export const deleteImageFromPost = (imageId) => {
  return axiosInstance.delete(`/posts/images/${imageId}`);
};

// Получить посты конкретного пользователя
export const getUserPosts = (userId, params = {}) => {
  return axiosInstance.get('/posts', {
    params: { ...params, userId: userId },
  });
};

// Поиск постов
export const searchPosts = (searchQuery, params = {}) => {
  return axiosInstance.get('/posts', {
    params: { ...params, search: searchQuery },
  });
};

// Лайк поста
export const likePost = (postId, increment) => {
  return axiosInstance.patch(`/posts/${postId}/like`, { increment });
};

// Получить комментарии поста
export const getComments = (postId) => {
  return axiosInstance.get(`/posts/${postId}/comments`);
};

// Добавить комментарий
export const addComment = (postId, text) => {
  return axiosInstance.post(`/posts/${postId}/comments`, { text });
};

// Удалить комментарий
export const deleteComment = (commentId) => {
  return axiosInstance.delete(`/posts/comments/${commentId}`);
};
