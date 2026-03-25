// Панель администратора
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { ShoppingBag, Users, DollarSign, Clock, CheckCircle, XCircle, RefreshCw, Flag, Tag, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as ordersApi from '../api/orders.api';
import * as usersApi from '../api/users.api';
import { getReports, updateReportStatus } from '../api/reports.api';
import { getPromos, createPromo, togglePromo, deletePromo } from '../api/promo.api';
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
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [promos, setPromos] = useState([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: '', discount: 10, maxUses: 100 });

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadOrders();
      loadStats();
    }
  }, [page, statusFilter, user]);

  useEffect(() => {
    if (activeTab === 'users'   && user?.role === 'ADMIN') loadUsers();
    if (activeTab === 'reports' && user?.role === 'ADMIN') loadReports();
    if (activeTab === 'promos'  && user?.role === 'ADMIN') loadPromos();
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

  const loadReports = async () => {
    setReportsLoading(true);
    try {
      const data = await getReports();
      setReports(data.data?.data?.reports || data.data?.reports || []);
    } catch { toast.error('Ошибка загрузки жалоб'); }
    finally { setReportsLoading(false); }
  };

  const handleReportStatus = async (id, status) => {
    try {
      await updateReportStatus(id, status);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success('Статус жалобы обновлён');
    } catch { toast.error('Ошибка'); }
  };

  const loadPromos = async () => {
    setPromosLoading(true);
    try {
      const data = await getPromos();
      setPromos(data.data?.data?.promoCodes || data.data?.promoCodes || []);
    } catch { toast.error('Ошибка загрузки промокодов'); }
    finally { setPromosLoading(false); }
  };

  const handleCreatePromo = async () => {
    if (!newPromo.code.trim()) return toast.error('Введите код');
    try {
      const data = await createPromo({ ...newPromo, discount: Number(newPromo.discount), maxUses: Number(newPromo.maxUses) });
      setPromos(prev => [data.data?.data?.promoCode || data.data?.promoCode, ...prev]);
      setNewPromo({ code: '', discount: 10, maxUses: 100 });
      toast.success('Промокод создан');
    } catch (e) { toast.error(e.response?.data?.message || 'Ошибка'); }
  };

  const handleTogglePromo = async (id) => {
    try {
      const data = await togglePromo(id);
      const updated = data.data?.data?.promoCode || data.data?.promoCode;
      setPromos(prev => prev.map(p => p.id === id ? updated : p));
    } catch { toast.error('Ошибка'); }
  };

  const handleDeletePromo = async (id) => {
    if (!confirm('Удалить промокод?')) return;
    try {
      await deletePromo(id);
      setPromos(prev => prev.filter(p => p.id !== id));
      toast.success('Промокод удалён');
    } catch { toast.error('Ошибка'); }
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
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'orders',  label: 'Заказы' },
            { key: 'users',   label: 'Пользователи' },
            { key: 'reports', label: 'Жалобы' },
            { key: 'promos',  label: 'Промокоды' },
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

        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-500" /> Жалобы ({reports.length})
              </span>
              <button onClick={loadReports} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition">
                <RefreshCw className="w-4 h-4" /> Обновить
              </button>
            </div>
            {reportsLoading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">Жалоб нет</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Отправитель</th>
                      <th className="px-4 py-3 text-left">Тип</th>
                      <th className="px-4 py-3 text-left">Причина</th>
                      <th className="px-4 py-3 text-left">Дата</th>
                      <th className="px-4 py-3 text-center">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {reports.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{r.reporter?.name || r.reporterId?.slice(0,8)}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.targetType}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">{r.reason}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{formatDate(r.createdAt)}</td>
                        <td className="px-4 py-3 text-center">
                          <select value={r.status} onChange={e => handleReportStatus(r.id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${
                              r.status === 'PENDING'  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                              r.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                                                        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'}`}>
                            <option value="PENDING">Ожидает</option>
                            <option value="REVIEWED">Рассмотрена</option>
                            <option value="RESOLVED">Решена</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'promos' && (
          <div className="space-y-6">
            {/* Создать промокод */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Создать промокод
              </h3>
              <div className="flex flex-wrap gap-3">
                <input value={newPromo.code} onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="КОД" className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm uppercase" />
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Скидка %</label>
                  <input type="number" min="1" max="100" value={newPromo.discount}
                    onChange={e => setNewPromo(p => ({ ...p, discount: e.target.value }))}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Макс. использований</label>
                  <input type="number" min="1" value={newPromo.maxUses}
                    onChange={e => setNewPromo(p => ({ ...p, maxUses: e.target.value }))}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
                <button onClick={handleCreatePromo}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition">
                  Создать
                </button>
              </div>
            </div>

            {/* Список промокодов */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-500" /> Промокоды ({promos.length})
                </span>
                <button onClick={loadPromos} className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition">
                  <RefreshCw className="w-4 h-4" /> Обновить
                </button>
              </div>
              {promosLoading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
              ) : promos.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Промокодов нет</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left">Код</th>
                        <th className="px-4 py-3 text-center">Скидка</th>
                        <th className="px-4 py-3 text-center">Использований</th>
                        <th className="px-4 py-3 text-center">Активен</th>
                        <th className="px-4 py-3 text-center">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {promos.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                          <td className="px-4 py-3 font-mono font-semibold text-gray-900 dark:text-white">{p.code}</td>
                          <td className="px-4 py-3 text-center text-blue-600 dark:text-blue-400 font-semibold">{p.discount}%</td>
                          <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{p.usedCount} / {p.maxUses}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => handleTogglePromo(p.id)} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                              {p.isActive
                                ? <ToggleRight className="w-6 h-6 text-green-500" />
                                : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => handleDeletePromo(p.id)} className="text-red-500 hover:text-red-700 transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
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
