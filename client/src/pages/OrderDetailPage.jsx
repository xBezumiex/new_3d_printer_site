import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, CheckCircle, Clock, Wrench, Truck, XCircle, Printer } from 'lucide-react';
import * as ordersApi from '../api/orders.api';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';

const TIMELINE = [
  { status: 'PENDING',     icon: Clock,       label: 'Принят',         desc: 'Заказ получен и ожидает подтверждения' },
  { status: 'CONFIRMED',   icon: CheckCircle, label: 'Подтверждён',    desc: 'Менеджер подтвердил заказ' },
  { status: 'IN_PROGRESS', icon: Wrench,      label: 'В работе',       desc: 'Ваша модель печатается' },
  { status: 'COMPLETED',   icon: Truck,       label: 'Готов к выдаче', desc: 'Печать завершена, можно забирать' },
];
const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
const MATERIAL_LABELS = { PLA: 'PLA', ABS: 'ABS', PETG: 'PETG', TPU: 'TPU', NYLON: 'Nylon' };
const QUALITY_LABELS  = { DRAFT: 'Черновик', STANDARD: 'Стандарт', HIGH: 'Высокое', ULTRA: 'Ультра' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadOrder(); }, [id]);

  const loadOrder = async () => {
    setIsLoading(true);
    try {
      const data = await ordersApi.getOrderById(id);
      setOrder(data.data.order || data.data);
    } catch (e) { toast.error(e?.message || 'Заказ не найден'); }
    finally { setIsLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg)' }}>
      <XCircle className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
      <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>Заказ не найден</p>
      <Link to="/dashboard" className="font-mono text-xs" style={{ color: 'var(--accent)' }}>← Вернуться к заказам</Link>
    </div>
  );

  const isCancelled = order.status === 'CANCELLED';
  const currentIdx  = STATUS_ORDER.indexOf(order.status);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 60 }}>
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '32px 0 24px' }}>
        <div className="container mx-auto px-6 max-w-3xl">
          <Breadcrumb items={[
            { label: 'Личный кабинет', to: '/dashboard' },
            { label: `Заказ #${order.id?.slice(0, 8).toUpperCase()}` },
          ]} />
          <p className="font-mono text-xs tracking-widest2 uppercase mb-2" style={{ color: 'var(--accent)' }}>/ трекинг</p>
          <h1 className="font-display tracking-widest" style={{ fontSize: 'clamp(1.5rem,4vw,2.5rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            ЗАКАЗ #{order.id?.slice(0, 8).toUpperCase()}
          </h1>
          <p className="font-mono text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-3xl space-y-4">
        {/* Timeline */}
        <div className="glass p-6">
          <p className="font-mono text-[10px] tracking-widest2 uppercase mb-6" style={{ color: 'var(--text-muted)' }}>Статус заказа</p>

          {isCancelled ? (
            <div className="flex items-center gap-3 p-4"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderLeft: '3px solid #f87171' }}>
              <XCircle className="w-5 h-5 shrink-0" style={{ color: '#f87171' }} />
              <div>
                <p className="font-sans font-semibold text-sm" style={{ color: '#f87171' }}>Заказ отменён</p>
                <p className="font-sans text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Обратитесь к менеджеру для уточнения деталей</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Progress line */}
              <div className="absolute top-5 h-px z-0" style={{ left: '2.5rem', right: '2.5rem', background: 'var(--border-strong)' }}>
                <div className="h-full transition-all duration-700"
                  style={{ background: 'var(--accent)', width: currentIdx < 0 ? '0%' : `${(currentIdx / (TIMELINE.length - 1)) * 100}%` }} />
              </div>

              <div className="relative z-10 flex justify-between">
                {TIMELINE.map((step, idx) => {
                  const Icon = step.icon;
                  const done    = idx < currentIdx;
                  const active  = idx === currentIdx;
                  const pending = idx > currentIdx;

                  return (
                    <div key={step.status} className="flex flex-col items-center w-1/4 text-center">
                      <div className="w-10 h-10 flex items-center justify-center mb-3 transition-all duration-300"
                        style={{
                          background: done || active ? 'var(--accent)' : 'var(--bg-raised)',
                          border: `1px solid ${done || active ? 'var(--accent)' : 'var(--border-strong)'}`,
                          boxShadow: active ? '0 0 20px var(--accent-glow)' : 'none',
                        }}>
                        <Icon className="w-4 h-4" style={{ color: done || active ? '#000' : 'var(--text-muted)' }} />
                      </div>
                      <p className="font-mono text-[10px] tracking-wider leading-tight"
                        style={{ color: active ? 'var(--accent)' : pending ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
                        {step.label}
                      </p>
                      {active && (
                        <p className="font-sans text-[11px] mt-1 leading-tight" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="glass p-6">
          <div className="flex items-center gap-3 mb-5">
            <Package className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <p className="font-mono text-[10px] tracking-widest2 uppercase" style={{ color: 'var(--text-muted)' }}>Детали заказа</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
            {[
              ['Файл модели', order.modelFile || '—',                                      false],
              ['Материал',    MATERIAL_LABELS[order.material] || order.material,            false],
              ['Качество',    QUALITY_LABELS[order.quality] || order.quality,               false],
              ['Заполнение',  `${order.infill}%`,                                           false],
              ['Количество',  `${order.quantity} шт.`,                                      false],
              ['Объём',       `${order.volume} см³`,                                        false],
              ['Вес',         `${order.weight} г`,                                          false],
              ['Стоимость',   `${Number(order.price).toLocaleString('ru-RU')} ₽`,          true],
            ].map(([label, value, highlight]) => (
              <div key={label}>
                <p className="font-mono text-[10px] tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="font-sans font-medium text-sm" style={{ color: highlight ? 'var(--accent)' : 'var(--text-primary)', fontSize: highlight ? 18 : 14 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
          {order.comments && (
            <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="font-mono text-[10px] tracking-wider uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Комментарий</p>
              <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{order.comments}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 print:hidden">
          <Link to="/dashboard"
            className="flex-1 text-center py-3 font-sans font-medium text-sm transition-colors"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', backdropFilter: 'blur(8px)' }}>
            ← К заказам
          </Link>
          <button onClick={() => window.print()}
            className="flex items-center justify-center gap-2 flex-1 py-3 font-sans font-medium text-sm transition-colors"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', backdropFilter: 'blur(8px)' }}>
            <Printer className="w-4 h-4" /> Скачать PDF
          </button>
          <Link to="/upload"
            className="flex-1 text-center py-3 font-sans font-semibold text-sm"
            style={{ background: 'var(--accent)', color: '#000' }}>
            + Новый заказ
          </Link>
        </div>
      </div>
    </div>
  );
}
