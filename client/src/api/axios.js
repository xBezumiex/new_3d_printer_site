import axios from 'axios';
import toast from 'react-hot-toast';

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
  (response) => {
    toast.dismiss('server-wakeup');
    return response;
  },
  async (error) => {
    const config = error.config;

    // Серверный ответ с HTTP-ошибкой
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

    // Нет ответа = сетевая ошибка (сервер спит или нет сети)
    // Фоновые polling-запросы (_noRetry) — тихо проваливаются
    if (config._noRetry) {
      return Promise.reject({ message: 'Сервер не отвечает', status: 0 });
    }

    const method = (config.method || 'get').toLowerCase();
    const isSafe = method === 'get';
    config._retryCount = (config._retryCount || 0) + 1;

    // GET — до 5 попыток, остальные — 1 повтор (на случай cold start Render)
    const maxRetries = isSafe ? 5 : 1;

    if (config._retryCount <= maxRetries) {
      if (config._retryCount === 1) {
        toast.loading('Сервер просыпается, подождите...', {
          id: 'server-wakeup',
          duration: 60000,
        });
      }

      // Нарастающая задержка: 5s, 8s, 10s, 12s, 15s
      const delays = [5000, 8000, 10000, 12000, 15000];
      const delay = delays[config._retryCount - 1] || 15000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      return axiosInstance(config);
    }

    // Исчерпали попытки
    toast.dismiss('server-wakeup');
    toast.error('Сервер недоступен. Попробуйте обновить страницу.', {
      id: 'server-offline',
      duration: 6000,
    });

    return Promise.reject({ message: 'Сервер не отвечает', status: 0 });
  }
);

export default axiosInstance;
