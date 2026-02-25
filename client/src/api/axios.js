// Настройка Axios для HTTP запросов
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('🔧 Axios API URL:', API_URL);

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
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ Axios error:', error);

    if (error.response) {
      const { status, data } = error.response;
      console.error('Response error:', { status, data });

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      return Promise.reject({
        message: data.error || data.message || 'Произошла ошибка',
        status,
        data
      });
    } else if (error.request) {
      console.error('Request error (no response):', error.request);
      return Promise.reject({
        message: 'Сервер не отвечает. Проверьте подключение.',
        status: 0
      });
    } else {
      console.error('Error setting up request:', error.message);
      return Promise.reject({
        message: error.message || 'Произошла ошибка',
        status: 0
      });
    }
  }
);

export default axiosInstance;
