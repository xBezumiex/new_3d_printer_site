import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BASE_URL = import.meta.env.BASE_URL || '/';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ── Request interceptor — JWT токен ──────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const loginPath = (BASE_URL + 'login').replace('//', '/');
        window.location.href = loginPath;
      }
      return Promise.reject({
        message: data?.error || data?.message || 'Произошла ошибка',
        status,
        data,
      });
    }
    // Сетевая ошибка — просто пробрасываем, компоненты сами обработают
    return Promise.reject({ message: 'Сервер не отвечает', status: 0 });
  }
);

export default axiosInstance;
