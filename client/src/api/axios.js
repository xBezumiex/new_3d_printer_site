// Настройка Axios для HTTP запросов
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Создание экземпляра axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Request interceptor - добавление JWT токена
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - обработка ошибок
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      return Promise.reject({
        message: data?.error || data?.message || 'Произошла ошибка',
        status,
        data
      });
    }

    // Сетевые ошибки (ERR_INTERNET_DISCONNECTED и т.п.) — тихо игнорируем
    return Promise.reject({
      message: 'Сервер не отвечает',
      status: 0
    });
  }
);

export default axiosInstance;
