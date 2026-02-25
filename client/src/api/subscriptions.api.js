// API для подписок
import axiosInstance from './axios';

// Подписаться
export const subscribe = (subscribedToId) => {
  return axiosInstance.post('/subscriptions', { subscribedToId });
};

// Отписаться
export const unsubscribe = (subscribedToId) => {
  return axiosInstance.delete(`/subscriptions/${subscribedToId}`);
};

// Получить подписчиков пользователя
export const getFollowers = (userId) => {
  return axiosInstance.get(`/subscriptions/${userId}/followers`);
};

// Получить подписки пользователя
export const getFollowing = (userId) => {
  return axiosInstance.get(`/subscriptions/${userId}/following`);
};

// Проверить статус подписки
export const checkFollowing = (userId) => {
  return axiosInstance.get(`/subscriptions/${userId}/check`);
};
