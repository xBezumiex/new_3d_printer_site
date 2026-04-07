import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle, XCircle, Package, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as ordersApi from '../api/orders.api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING:     { label: 'Ожидает',     color: '#FACC15', bg: 'rgba(250,204,21,0.12)',  border: 'rgba(250,204,21,0.3)' },
  CONFIRMED:   { label: 'Подтверждён', color: '#4F8EF7', bg: 'rgba(79,142,247,0.12)', border: 'rgba(79,142,247,0.3)' },
  IN_PROGRESS: { label: 'В работе',    color: '#C084FC', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.3)' },
  COMPLETED:   { label: 'Выполнен',    color: '#4ADE80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)' },
  CANCELLED:   { label: 'Отменён',     color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
};

const MATERIAL_LABELS = { PLA: 'PLA', ABS: 'ABS', PETG: 'PETG', TPU: 'TPU', NYLON: 'Nylon' };
const QUALITY_LABELS  = { DRAFT: 'Черновик', STANDARD: 'Стандарт', HIGH: 'Высокое', ULTRA: 'Ультра' };

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="glass overflow-hidden" style={{ borderLeft: `2px solid ${status.color}` }}>
      <div className="flex items-center justify-between p-4 cursor-pointer transition-colors"
        style={{ background: expanded ? 'var(--glass-bg-hover)' : 'transparent' }}
        onClick={() => setExpanded(v => !v)}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = expanded ? 'var(--glass-bg-hover)' : 'transparent'}>
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-9 h-9 flex items-center justify-center shrink-0"
            style={{ background: status.bg, border: `1px solid ${status.border}` }}>
            <Package className="w-4 h-4" style={{ color: status.color }} />
          </div>
          <div className="min-w-0">
            <p className="font-sans font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {order.modelFile || 'Модель без файла'}
            </p>
            <p className="font-mono text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <span className="hidden sm:inline font-mono text-[11px] px-2 py-1 tracking-wider"
            style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
            {status.label}
          </span>
          <span className="font-sans font-bold text-sm" style={{ color: 'var(--accent)' }}>
            {Number(order.price).toLocaleString('ru-RU')} ₽
          </span>
          <Link to={`/orders/${order.id}`} onClick={e => e.stopPropagation()}
            className="hidden sm:inline font-mono text-[11px] px-2 py-1 tracking-wider transition-colors"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(255,77,0,0.2)' }}>
            Трекинг →
          </Link>
          {expanded ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="sm:hidden flex items-center gap-3 mb-3 flex-wrap">
            <span className="font-mono text-[11px] px-2 py-1 tracking-wider"
              style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
              {status.label}
            </span>
            <Link to={`/orders/${order.id}`} onClick={e => e.stopPropagation()}
              className="font-mono text-[11px] px-2 py-1 tracking-wider"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(255,77,0,0.2)' }}>
              Трекинг →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              ['Материал', MATERIAL_LABELS[order.material] || order.material],
              ['Качество', QUALITY_LABELS[order.quality] || order.quality],
              ['Заполнение', `${order.infill}%`],
              ['Количество', `${order.quantity} шт.`],
              ['Объём', `${order.volume} см³`],
              ['Вес', `${order.weight} г`],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="font-mono text-[10px] tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="font-sans text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{val}</p>
              </div>
            ))}
            {order.comments && (
              <div className="col-span-2 md:col-span-3">
                <p className="font-mono text-[10px] tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Комментарий</p>
                <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>{order.comments}</p>
              </div>
            )}
          </div>
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

  useEffect(() => { loadOrders(page); }, [page]);

  const loadOrders = async (p = 1) => {
    setIsLoading(true);
    try {
      const data = await ordersApi.getOrders({ page: p, limit: 10 });
      setOrders(data.data.orders || []);
      setPagination(data.data.pagination || null);
    } catch (err) {
      if (err?.status !== 0) toast.error(err?.message || 'Не удалось загрузить заказы');
    } finally { setIsLoading(false); }
  };

  const total      = pagination?.total ?? orders.length;
  const inProgress = orders.filter(o => ['PENDING','CONFIRMED','IN_PROGRESS'].includes(o.status)).length;
  const completed  = orders.filter(o => o.status === 'COMPLETED').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '48px 0 32px' }}>
        <div className="container mx-auto px-6">
          <p className="font-mono text-xs tracking-widest2 uppercase mb-3" style={{ color: 'var(--accent)' }}>/ кабинет</p>
          <h1 className="font-display tracking-widest" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            {user ? `ПРИВЕТ, ${user.name.toUpperCase()}` : 'ЛИЧНЫЙ КАБИНЕТ'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: ShoppingBag, label: 'Всего заказов', value: total,      color: '#4F8EF7' },
            { icon: Clock,       label: 'В обработке',   value: inProgress, color: '#FACC15' },
            { icon: CheckCircle, label: 'Выполнено',      value: completed,  color: '#4ADE80' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass glass-hover p-6 flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="font-display text-4xl" style={{ color }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Orders */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="font-mono text-xs tracking-widest2 uppercase" style={{ color: 'var(--text-muted)' }}>Мои заказы</p>
            <Link to="/upload"
              className="flex items-center gap-2 font-mono text-xs tracking-wider px-4 py-2 transition-colors"
              style={{ background: 'var(--accent)', color: '#000' }}>
              <Plus className="w-3.5 h-3.5" /> Новый заказ
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <XCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
              <p className="font-sans font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>У вас пока нет заказов</p>
              <p className="font-sans text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Загрузите 3D-модель и оформите первый заказ</p>
              <Link to="/upload" className="font-mono text-xs tracking-wider px-6 py-3 inline-block"
                style={{ background: 'var(--accent)', color: '#000' }}>
                Загрузить модель
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="glass px-4 py-2 font-mono text-xs tracking-wider transition-opacity disabled:opacity-30"
                style={{ color: 'var(--text-secondary)' }}>
                ← Назад
              </button>
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                {page} / {pagination.totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                className="glass px-4 py-2 font-mono text-xs tracking-wider transition-opacity disabled:opacity-30"
                style={{ color: 'var(--text-secondary)' }}>
                Вперёд →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
