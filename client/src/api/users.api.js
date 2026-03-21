// API для работы с пользователями
import axiosInstance from './axios';

export const getUsers = async (params = {}) => {
  const response = await axiosInstance.get('/users', { params });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userId, data) => {
  const response = await axiosInstance.put(`/users/${userId}`, data);
  return response.data;
};

export const getUserPosts = async (userId, params = {}) => {
  const response = await axiosInstance.get(`/users/${userId}/posts`, { params });
  return response.data;
};

export const searchUsers = async (query) => {
  const response = await axiosInstance.get('/users', { params: { search: query } });
  return response.data;
};
