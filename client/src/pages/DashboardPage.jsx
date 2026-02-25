// Личный кабинет - список заказов пользователя
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle, XCircle, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as ordersApi from '../api/orders.api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING:     { label: 'Ожидает',       color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  CONFIRMED:   { label: 'Подтверждён',   color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  IN_PROGRESS: { label: 'В работе',      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  COMPLETED:   { label: 'Выполнен',      color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  CANCELLED:   { label: 'Отменён',       color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
};

const MATERIAL_LABELS = {
  PLA: 'PLA', ABS: 'ABS', PETG: 'PETG', TPU: 'TPU', NYLON: 'Nylon',
};
const QUALITY_LABELS = {
  DRAFT: 'Черновик', STANDARD: 'Стандарт', HIGH: 'Высокое', ULTRA: 'Ультра',
};

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('ru-RU', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Заголовок карточки */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <Package className="w-8 h-8 text-blue-500 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {order.modelFile || 'Модель без файла'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4 shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
            {status.label}
          </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {Number(order.price).toLocaleString('ru-RU')} ₽
          </span>
          <Link
            to={`/orders/${order.id}`}
            onClick={e => e.stopPropagation()}
            className="text-xs px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition font-medium whitespace-nowrap"
          >
            Трекинг →
          </Link>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />
          }
        </div>
      </div>

      {/* Детали (разворачиваются) */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Материал</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {MATERIAL_LABELS[order.material] || order.material}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Качество</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {QUALITY_LABELS[order.quality] || order.quality}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Заполнение</span>
            <p className="font-medium text-gray-900 dark:text-white">{order.infill}%</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Количество</span>
            <p className="font-medium text-gray-900 dark:text-white">{order.quantity} шт.</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Объём</span>
            <p className="font-medium text-gray-900 dark:text-white">{order.volume} см³</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Вес</span>
            <p className="font-medium text-gray-900 dark:text-white">{order.weight} г</p>
          </div>
          {order.comments && (
            <div className="col-span-2 md:col-span-3">
              <span className="text-gray-500 dark:text-gray-400">Комментарий</span>
              <p className="font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{order.comments}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadOrders(page);
  }, [page]);

  const loadOrders = async (p = 1) => {
    setIsLoading(true);
    try {
      const data = await ordersApi.getOrders({ page: p, limit: 10 });
      setOrders(data.data.orders || []);
      setPagination(data.data.pagination || null);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
      toast.error(error?.message || 'Не удалось загрузить заказы');
    } finally {
      setIsLoading(false);
    }
  };

  const total      = pagination?.total ?? orders.length;
  const inProgress = orders.filter((o) => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(o.status)).length;
  const completed  = orders.filter((o) => o.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Личный кабинет
        </h1>
        {user && (
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Привет, {user.name}!
          </p>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex items-center gap-4">
            <ShoppingBag className="w-10 h-10 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Всего заказов</p>
              <p className="text-3xl font-bold text-blue-600">{total}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex items-center gap-4">
            <Clock className="w-10 h-10 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">В обработке</p>
              <p className="text-3xl font-bold text-yellow-600">{inProgress}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex items-center gap-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Выполнено</p>
              <p className="text-3xl font-bold text-green-600">{completed}</p>
            </div>
          </div>
        </div>

        {/* Список заказов */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Мои заказы
            </h2>
            <Link
              to="/upload"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition"
            >
              + Новый заказ
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">У вас пока нет заказов</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 mb-6">
                Загрузите 3D-модель и оформите первый заказ
              </p>
              <Link
                to="/upload"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                Загрузить модель
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}

          {/* Пагинация */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 transition"
              >
                ← Назад
              </button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400 text-sm">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 transition"
              >
                Вперёд →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
