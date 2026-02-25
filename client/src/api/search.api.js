// API для поиска
import axiosInstance from './axios';

// Поиск (all, posts, users)
export const search = (query, type = 'all', limit = 10) => {
  return axiosInstance.get('/search', {
    params: { q: query, type, limit },
  });
};
