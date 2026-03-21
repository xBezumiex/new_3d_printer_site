// Панель администратора
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { ShoppingBag, Users, DollarSign, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as ordersApi from '../api/orders.api';
import * as usersApi from '../api/users.api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING:     { label: 'Ожидает',     color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  CONFIRMED:   { label: 'Подтверждён', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  IN_PROGRESS: { label: 'В работе',    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  COMPLETED:   { label: 'Выполнен',    color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  CANCELLED:   { label: 'Отменён',     color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
};

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const MATERIAL_LABELS = { PLA: 'PLA', ABS: 'ABS', PETG: 'PETG', TPU: 'TPU', NYLON: 'Nylon' };

export default function AdminPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadOrders();
      loadStats();
    }
  }, [page, statusFilter, user]);

  useEffect(() => {
    if (activeTab === 'users' && user?.role === 'ADMIN') loadUsers();
  }, [activeTab, user]);

  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />;

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const data = await ordersApi.getOrders(params);
      setOrders(data.data.orders || []);
      setPagination(data.data.pagination || null);
    } catch (e) {
      toast.error('Ошибка загрузки заказов');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await ordersApi.getOrdersStats();
      setStats(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await usersApi.getUsers();
      setUsers(data.data?.users || []);
    } catch (e) {
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Статус обновлён');
      loadStats();
    } catch (e) {
      toast.error(e?.message || 'Ошибка обновления статуса');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Панель администратора
        </h1>

        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<ShoppingBag className="w-7 h-7 text-blue-500" />}
              label="Всего заказов" value={stats.total} color="blue" />
            <StatCard icon={<Clock className="w-7 h-7 text-yellow-500" />}
              label="В обработке" value={(stats.byStatus?.pending || 0) + (stats.byStatus?.confirmed || 0) + (stats.byStatus?.inProgress || 0)} color="yellow" />
            <StatCard icon={<CheckCircle className="w-7 h-7 text-green-500" />}
              label="Выполнено" value={stats.byStatus?.completed || 0} color="green" />
            <StatCard icon={<DollarSign className="w-7 h-7 text-emerald-500" />}
              label="Выручка" value={`${Number(stats.totalRevenue || 0).toLocaleString('ru-RU')} ₽`} color="emerald" />
          </div>
        )}

        {/* Табы */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'orders', label: 'Заказы' },
            { key: 'users',  label: 'Пользователи' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-5 py-2 rounded-lg font-semibold transition ${activeTab === key
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Фильтр */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Статус:</span>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Все</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
              <button onClick={() => { loadOrders(); loadStats(); }}
                className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition">
                <RefreshCw className="w-4 h-4" /> Обновить
              </button>
            </div>

            {/* Таблица */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">Заказов нет</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Клиент</th>
                      <th className="px-4 py-3 text-left">Файл</th>
                      <th className="px-4 py-3 text-left">Материал</th>
                      <th className="px-4 py-3 text-right">Сумма</th>
                      <th className="px-4 py-3 text-left">Дата</th>
                      <th className="px-4 py-3 text-center">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">{order.user?.name || '—'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{order.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[140px] truncate">
                          {order.modelFile || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {MATERIAL_LABELS[order.material] || order.material}
                          <span className="text-xs text-gray-400 ml-1">/ {order.infill}%</span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-600 dark:text-blue-400">
                          {Number(order.price).toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_CONFIG[order.status]?.color}`}
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Пагинация */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  ← Назад
                </button>
                <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{page} / {pagination.totalPages}</span>
                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  Вперёд →
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Всего пользователей: {users.length}
              </span>
              <button onClick={loadUsers}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition">
                <RefreshCw className="w-4 h-4" /> Обновить
              </button>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                Пользователей нет
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Имя</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Роль</th>
                      <th className="px-4 py-3 text-left">Посты</th>
                      <th className="px-4 py-3 text-left">Заказы</th>
                      <th className="px-4 py-3 text-left">Дата регистрации</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {u.avatar
                              ? <img src={u.avatar} loading="lazy" className="w-8 h-8 rounded-full object-cover" alt="" />
                              : <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                  {u.name?.[0]?.toUpperCase() || '?'}
                                </div>
                            }
                            <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'ADMIN'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                            {u.role === 'ADMIN' ? 'Админ' : 'Пользователь'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{u._count?.posts ?? 0}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{u._count?.orders ?? 0}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                          {formatDate(u.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex items-center gap-4">
      <div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-900/20`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
      </div>
    </div>
  );
}
