// Настройка Axios для HTTP запросов
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BASE_URL = import.meta.env.BASE_URL || '/';

// Создание экземпляра axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ── Очередь запросов, прерванных офлайном ────────────────────────────────────
// Когда сеть пропадает, запросы накапливаются. При восстановлении — повторяются.
let offlineQueue = [];
let isOffline = !navigator.onLine;

window.addEventListener('offline', () => {
  isOffline = true;
  toast.error('Нет подключения к интернету', { id: 'offline', duration: Infinity });
});

window.addEventListener('online', () => {
  isOffline = false;
  toast.dismiss('offline');
  toast.success('Соединение восстановлено', { id: 'online', duration: 3000 });

  // Повторяем все запросы из очереди
  const queue = [...offlineQueue];
  offlineQueue = [];
  queue.forEach(({ config, resolve, reject }) => {
    axiosInstance(config).then(resolve).catch(reject);
  });
});

// ── Request interceptor — JWT токен ──────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — обработка ошибок + retry при cold start ───────────
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

    // Нет ответа = сетевая ошибка
    // Фоновые polling-запросы (_noRetry) — тихо проваливаются без retry
    if (config._noRetry) {
      return Promise.reject({ message: 'Сервер не отвечает', status: 0 });
    }

    // Офлайн: кладём запрос в очередь, не ретраим — нет смысла
    if (!navigator.onLine) {
      toast.error('Нет подключения к интернету', { id: 'offline', duration: Infinity });
      return new Promise((resolve, reject) => {
        offlineQueue.push({ config, resolve, reject });
      });
    }

    // Онлайн, но сервер не ответил (cold start на Render)
    const method = (config.method || 'get').toLowerCase();
    const isSafe = method === 'get';
    config._retryCount = (config._retryCount || 0) + 1;

    // GET — до 5 попыток, остальные — 1 повтор (на случай cold start)
    const maxRetries = isSafe ? 5 : 1;

    if (config._retryCount <= maxRetries) {
      if (config._retryCount === 1) {
        toast.loading('Сервер просыпается, подождите...', {
          id: 'server-wakeup',
          duration: 60000,
        });
      }

      // Нарастающая задержка: 5s, 8s, 10s, 12s, 15s — покрывает ~50с cold start
      const delays = [5000, 8000, 10000, 12000, 15000];
      const delay = delays[config._retryCount - 1] || 15000;

      // Во время ожидания проверяем не ушли ли офлайн
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Если за время ожидания пропала сеть — в очередь
      if (!navigator.onLine) {
        return new Promise((resolve, reject) => {
          offlineQueue.push({ config, resolve, reject });
        });
      }

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
