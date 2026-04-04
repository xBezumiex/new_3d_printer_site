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
  PENDING:     { label: 'Ожидает',     color: '#FACC15' },
  CONFIRMED:   { label: 'Подтверждён', color: '#4F8EF7' },
  IN_PROGRESS: { label: 'В работе',    color: '#C084FC' },
  COMPLETED:   { label: 'Выполнен',    color: '#4ADE80' },
  CANCELLED:   { label: 'Отменён',     color: '#f87171' },
};

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const MATERIAL_LABELS = { PLA: 'PLA', ABS: 'ABS', PETG: 'PETG', TPU: 'TPU', NYLON: 'Nylon' };

function StatCard({ icon, label, value, color }) {
  return (
    <div className="glass p-5 flex items-center gap-4">
      <div className="w-10 h-10 flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="font-display tracking-widest text-xl mt-0.5" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

const inputStyle = {
  background: 'var(--bg-raised)', border: '1px solid var(--border-strong)',
  color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
  padding: '8px 12px',
};

const selectStyle = {
  background: 'var(--bg-raised)', border: '1px solid var(--border-strong)',
  color: 'var(--text-primary)', fontFamily: 'DM Mono, monospace', fontSize: 11,
  padding: '6px 8px', cursor: 'pointer',
};

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
    if (user?.role === 'ADMIN') { loadOrders(); loadStats(); }
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
    } catch { toast.error('Ошибка загрузки заказов'); }
    finally { setIsLoading(false); }
  };

  const loadStats = async () => {
    try {
      const data = await ordersApi.getOrdersStats();
      setStats(data.data);
    } catch {}
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await usersApi.getUsers();
      setUsers(data.data?.users || []);
    } catch { toast.error('Ошибка загрузки пользователей'); }
    finally { setUsersLoading(false); }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Статус обновлён');
      loadStats();
    } catch (e) { toast.error(e?.message || 'Ошибка'); }
    finally { setUpdatingId(null); }
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
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const Spinner = () => (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  const thTd = { padding: '10px 16px', textAlign: 'left', fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' };
  const tdStyle = { padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', fontSize: 13, borderBottom: '1px solid var(--border)' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 60 }}>
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '32px 0 24px' }}>
        <div className="container mx-auto px-6">
          <p className="font-mono text-xs tracking-widest2 uppercase mb-3" style={{ color: 'var(--accent)' }}>/ admin</p>
          <h1 className="font-display tracking-widest" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            ПАНЕЛЬ АДМИНИСТРАТОРА
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="Всего заказов" value={stats.total} color="#4F8EF7" />
            <StatCard icon={<Clock className="w-5 h-5" />} label="В обработке"
              value={(stats.byStatus?.pending || 0) + (stats.byStatus?.confirmed || 0) + (stats.byStatus?.inProgress || 0)} color="#FACC15" />
            <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Выполнено" value={stats.byStatus?.completed || 0} color="#4ADE80" />
            <StatCard icon={<DollarSign className="w-5 h-5" />} label="Выручка"
              value={`${Number(stats.totalRevenue || 0).toLocaleString('ru-RU')} ₽`} color="var(--accent)" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 w-fit" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', padding: 4, backdropFilter: 'blur(12px)' }}>
          {[
            { key: 'orders',  label: 'Заказы' },
            { key: 'users',   label: 'Пользователи' },
            { key: 'reports', label: 'Жалобы' },
            { key: 'promos',  label: 'Промокоды' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="px-4 py-2 font-mono text-xs tracking-wider transition-all"
              style={{ background: activeTab === key ? 'var(--accent)' : 'transparent', color: activeTab === key ? '#000' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {activeTab === 'orders' && (
          <div className="glass overflow-hidden">
            <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="font-mono text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>Статус:</span>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} style={selectStyle}>
                <option value="">Все</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
              <button onClick={() => { loadOrders(); loadStats(); }}
                className="ml-auto flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 transition-colors"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <RefreshCw className="w-3.5 h-3.5" /> Обновить
              </button>
            </div>

            {isLoading ? <Spinner /> : orders.length === 0 ? (
              <div className="text-center py-12 font-sans text-sm" style={{ color: 'var(--text-muted)' }}>Заказов нет</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: 'var(--bg-raised)' }}>
                    <tr>
                      {['Клиент', 'Файл', 'Материал', 'Сумма', 'Дата', 'Статус'].map(h => (
                        <th key={h} style={{ ...thTd, color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} style={{ transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={tdStyle}>
                          <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{order.user?.name || '—'}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Mono, monospace' }}>{order.user?.email}</p>
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--text-secondary)', maxWidth: 140 }}>
                          <span className="truncate block">{order.modelFile || '—'}</span>
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>
                          {MATERIAL_LABELS[order.material] || order.material}
                          <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 4 }}>/ {order.infill}%</span>
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--accent)', fontWeight: 600, textAlign: 'right' }}>
                          {Number(order.price).toLocaleString('ru-RU')} ₽
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 11, whiteSpace: 'nowrap', fontFamily: 'DM Mono, monospace' }}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td style={tdStyle}>
                          <select value={order.status} disabled={updatingId === order.id}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                            style={{ ...selectStyle, color: STATUS_CONFIG[order.status]?.color, background: `${STATUS_CONFIG[order.status]?.color}15`, border: `1px solid ${STATUS_CONFIG[order.status]?.color}40` }}>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="font-mono text-xs px-4 py-2 transition-colors"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                  ← Назад
                </button>
                <span className="font-mono text-xs px-4 py-2" style={{ color: 'var(--text-muted)' }}>{page} / {pagination.totalPages}</span>
                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                  className="font-mono text-xs px-4 py-2 transition-colors"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: page === pagination.totalPages ? 'default' : 'pointer', opacity: page === pagination.totalPages ? 0.4 : 1 }}>
                  Вперёд →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reports tab */}
        {activeTab === 'reports' && (
          <div className="glass overflow-hidden">
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                <Flag className="w-3.5 h-3.5" style={{ color: '#f87171' }} /> Жалобы ({reports.length})
              </span>
              <button onClick={loadReports} className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 transition-colors"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <RefreshCw className="w-3.5 h-3.5" /> Обновить
              </button>
            </div>
            {reportsLoading ? <Spinner /> : reports.length === 0 ? (
              <div className="text-center py-12 font-sans text-sm" style={{ color: 'var(--text-muted)' }}>Жалоб нет</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: 'var(--bg-raised)' }}>
                    <tr>
                      {['Отправитель', 'Тип', 'Причина', 'Дата', 'Статус'].map(h => (
                        <th key={h} style={{ ...thTd, color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ ...tdStyle, color: 'var(--text-primary)' }}>{r.reporter?.name || r.reporterId?.slice(0, 8)}</td>
                        <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>{r.targetType}</td>
                        <td style={{ ...tdStyle, color: 'var(--text-secondary)', maxWidth: 200 }}>
                          <span className="truncate block">{r.reason}</span>
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap' }}>{formatDate(r.createdAt)}</td>
                        <td style={tdStyle}>
                          <select value={r.status} onChange={e => handleReportStatus(r.id, e.target.value)}
                            style={{ ...selectStyle,
                              color: r.status === 'PENDING' ? '#FACC15' : r.status === 'REVIEWED' ? '#4F8EF7' : '#4ADE80',
                              background: r.status === 'PENDING' ? 'rgba(250,204,21,0.1)' : r.status === 'REVIEWED' ? 'rgba(79,142,247,0.1)' : 'rgba(74,222,128,0.1)',
                            }}>
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

        {/* Promos tab */}
        {activeTab === 'promos' && (
          <div className="space-y-5">
            <div className="glass p-6">
              <p className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
                <Plus className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Создать промокод
              </p>
              <div className="flex flex-wrap gap-3">
                <input value={newPromo.code} onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="КОД" style={{ ...inputStyle, flexGrow: 1, minWidth: 120, textTransform: 'uppercase', fontFamily: 'DM Mono, monospace' }} />
                <div className="flex items-center gap-2">
                  <label className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Скидка %</label>
                  <input type="number" min="1" max="100" value={newPromo.discount}
                    onChange={e => setNewPromo(p => ({ ...p, discount: e.target.value }))}
                    style={{ ...inputStyle, width: 70 }} />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Макс. использований</label>
                  <input type="number" min="1" value={newPromo.maxUses}
                    onChange={e => setNewPromo(p => ({ ...p, maxUses: e.target.value }))}
                    style={{ ...inputStyle, width: 80 }} />
                </div>
                <button onClick={handleCreatePromo}
                  className="font-sans font-semibold text-sm px-5 py-2 transition-opacity"
                  style={{ background: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Создать
                </button>
              </div>
            </div>

            <div className="glass overflow-hidden">
              <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                  <Tag className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} /> Промокоды ({promos.length})
                </span>
                <button onClick={loadPromos} className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 transition-colors"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <RefreshCw className="w-3.5 h-3.5" /> Обновить
                </button>
              </div>
              {promosLoading ? <Spinner /> : promos.length === 0 ? (
                <div className="text-center py-12 font-sans text-sm" style={{ color: 'var(--text-muted)' }}>Промокодов нет</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ background: 'var(--bg-raised)' }}>
                      <tr>
                        {['Код', 'Скидка', 'Использований', 'Активен', 'Действия'].map(h => (
                          <th key={h} style={{ ...thTd, color: 'var(--text-muted)', textAlign: h === 'Код' ? 'left' : 'center' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {promos.map(p => (
                        <tr key={p.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ ...tdStyle, fontFamily: 'DM Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{p.code}</td>
                          <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--accent)', fontWeight: 600 }}>{p.discount}%</td>
                          <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-secondary)' }}>{p.usedCount} / {p.maxUses}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <button onClick={() => handleTogglePromo(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                              {p.isActive
                                ? <ToggleRight className="w-6 h-6" style={{ color: '#4ADE80' }} />
                                : <ToggleLeft className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />}
                            </button>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <button onClick={() => handleDeletePromo(p.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
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

        {/* Users tab */}
        {activeTab === 'users' && (
          <div className="glass overflow-hidden">
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                Всего пользователей: {users.length}
              </span>
              <button onClick={loadUsers} className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 transition-colors"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <RefreshCw className="w-3.5 h-3.5" /> Обновить
              </button>
            </div>

            {usersLoading ? <Spinner /> : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>Пользователей нет</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: 'var(--bg-raised)' }}>
                    <tr>
                      {['Имя', 'Email', 'Роль', 'Посты', 'Заказы', 'Дата регистрации'].map(h => (
                        <th key={h} style={{ ...thTd, color: 'var(--text-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={tdStyle}>
                          <div className="flex items-center gap-2">
                            {u.avatar
                              ? <img src={u.avatar} loading="lazy" className="w-8 h-8 object-cover" style={{ borderRadius: '50%' }} alt="" />
                              : <div className="w-8 h-8 flex items-center justify-center font-display text-sm"
                                  style={{ borderRadius: '50%', background: 'rgba(255,77,0,0.15)', border: '1px solid rgba(255,77,0,0.3)', color: 'var(--accent)' }}>
                                  {u.name?.[0]?.toUpperCase() || '?'}
                                </div>}
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--text-secondary)', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{u.email}</td>
                        <td style={tdStyle}>
                          <span className="font-mono text-[10px] px-2 py-1"
                            style={{
                              background: u.role === 'ADMIN' ? 'rgba(248,113,113,0.15)' : 'var(--bg-raised)',
                              color: u.role === 'ADMIN' ? '#f87171' : 'var(--text-muted)',
                              border: `1px solid ${u.role === 'ADMIN' ? 'rgba(248,113,113,0.3)' : 'var(--border)'}`,
                            }}>
                            {u.role === 'ADMIN' ? 'Админ' : 'Пользователь'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>{u._count?.posts ?? 0}</td>
                        <td style={{ ...tdStyle, color: 'var(--text-secondary)' }}>{u._count?.orders ?? 0}</td>
                        <td style={{ ...tdStyle, color: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Mono, monospace', whiteSpace: 'nowrap' }}>
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
