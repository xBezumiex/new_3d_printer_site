import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BASE_URL = import.meta.env.BASE_URL || '/';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Circuit breaker: после исчерпания ретраев блокируем все запросы на 30с,
// чтобы параллельные компоненты не спамили консоль одинаковыми ошибками
let _circuitBreakerUntil = 0;

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
    _circuitBreakerUntil = 0; // сервер ожил — сбрасываем circuit breaker
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

    // Нет ответа = сетевая ошибка

    // Фоновые polling-запросы (_noRetry) — тихо проваливаются без retry
    if (config._noRetry) {
      return Promise.reject({ message: 'Сервер не отвечает', status: 0 });
    }

    // Circuit breaker: сервер уже признан недоступным — не дублируем запросы
    if (Date.now() < _circuitBreakerUntil) {
      return Promise.reject({ message: 'Сервер не отвечает', status: 0 });
    }

    // Устройство офлайн — ретраи бессмысленны
    if (navigator.onLine === false) {
      return Promise.reject({ message: 'Нет подключения к интернету', status: 0 });
    }

    config._retryCount = (config._retryCount || 0) + 1;

    // 2 попытки для GET (cold start Render ~15с), 1 для остальных
    const maxRetries = (config.method || 'get').toLowerCase() === 'get' ? 2 : 1;

    if (config._retryCount <= maxRetries) {
      if (config._retryCount === 1) {
        toast.loading('Сервер просыпается, подождите...', {
          id: 'server-wakeup',
          duration: 40000,
        });
      }
      // 8с первая попытка, 12с вторая — покрывает cold start Render
      const delay = config._retryCount === 1 ? 8000 : 12000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return axiosInstance(config);
    }

    // Исчерпали ретраи — включаем circuit breaker на 30с
    _circuitBreakerUntil = Date.now() + 30_000;
    toast.dismiss('server-wakeup');
    toast.error('Сервер недоступен. Попробуйте позже.', {
      id: 'server-offline',
      duration: 5000,
    });
    return Promise.reject({ message: 'Сервер не отвечает', status: 0 });
  }
);

export default axiosInstance;
