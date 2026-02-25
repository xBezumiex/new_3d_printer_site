// API для авторизации
import axios from './axios';

export const register = async (userData) => {
  const response = await axios.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axios.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axios.get('/auth/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await axios.put('/auth/me', profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await axios.put('/auth/password', passwordData);
  return response.data;
};

export const logout = async () => {
  const response = await axios.post('/auth/logout');
  return response.data;
};
