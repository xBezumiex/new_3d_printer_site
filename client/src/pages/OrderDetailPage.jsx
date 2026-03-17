// Страница детального просмотра заказа с трекингом
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle, Clock, Wrench, Truck, XCircle } from 'lucide-react';
import * as ordersApi from '../api/orders.api';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';

const TIMELINE = [
  { status: 'PENDING',     icon: Clock,        label: 'Принят',         desc: 'Заказ получен и ожидает подтверждения' },
  { status: 'CONFIRMED',   icon: CheckCircle,  label: 'Подтверждён',    desc: 'Менеджер подтвердил заказ' },
  { status: 'IN_PROGRESS', icon: Wrench,       label: 'В работе',       desc: 'Ваша модель печатается' },
  { status: 'COMPLETED',   icon: Truck,        label: 'Готов к выдаче', desc: 'Печать завершена, можно забирать' },
];

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

const MATERIAL_LABELS = { PLA: 'PLA', ABS: 'ABS', PETG: 'PETG', TPU: 'TPU', NYLON: 'Nylon' };
const QUALITY_LABELS  = { DRAFT: 'Черновик', STANDARD: 'Стандарт', HIGH: 'Высокое', ULTRA: 'Ультра' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setIsLoading(true);
    try {
      const data = await ordersApi.getOrderById(id);
      setOrder(data.data.order || data.data);
    } catch (e) {
      toast.error(e?.message || 'Заказ не найден');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-4">
        <XCircle className="w-16 h-16 text-gray-400" />
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">Заказ не найден</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline">← Вернуться к заказам</Link>
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELLED';
  const currentIdx  = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <Breadcrumb items={[
          { label: 'Личный кабинет', to: '/dashboard' },
          { label: `Заказ #${order.id?.slice(0, 8).toUpperCase()}` },
        ]} />

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Заказ #{order.id?.slice(0, 8).toUpperCase()}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{formatDate(order.createdAt)}</p>

        {/* Трекинг */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Статус заказа</h2>

          {isCancelled ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
              <XCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-semibold">Заказ отменён</p>
                <p className="text-sm opacity-80">Обратитесь к менеджеру для уточнения деталей</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Линия прогресса */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700 z-0"
                style={{ left: '2.25rem', right: '2.25rem' }}>
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: currentIdx < 0 ? '0%' : `${(currentIdx / (TIMELINE.length - 1)) * 100}%` }}
                />
              </div>

              <div className="relative z-10 flex justify-between">
                {TIMELINE.map((step, idx) => {
                  const Icon = step.icon;
                  const done    = idx < currentIdx;
                  const active  = idx === currentIdx;
                  const pending = idx > currentIdx;

                  return (
                    <div key={step.status} className="flex flex-col items-center w-1/4 text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                        ${done   ? 'bg-blue-600 text-white' : ''}
                        ${active ? 'bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-900' : ''}
                        ${pending? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' : ''}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`text-xs font-semibold ${active ? 'text-blue-600 dark:text-blue-400' : pending ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {step.label}
                      </p>
                      {active && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">{step.desc}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Детали */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" /> Детали заказа
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
            <Detail label="Файл модели" value={order.modelFile || '—'} />
            <Detail label="Материал"    value={MATERIAL_LABELS[order.material] || order.material} />
            <Detail label="Качество"    value={QUALITY_LABELS[order.quality] || order.quality} />
            <Detail label="Заполнение"  value={`${order.infill}%`} />
            <Detail label="Количество"  value={`${order.quantity} шт.`} />
            <Detail label="Объём"       value={`${order.volume} см³`} />
            <Detail label="Вес"         value={`${order.weight} г`} />
            <Detail label="Стоимость"   value={`${Number(order.price).toLocaleString('ru-RU')} ₽`} highlight />
          </div>
          {order.comments && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Комментарий</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{order.comments}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Link to="/dashboard"
            className="flex-1 text-center py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition">
            ← К списку заказов
          </Link>
          <Link to="/upload"
            className="flex-1 text-center py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition">
            + Новый заказ
          </Link>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, highlight }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`font-medium mt-0.5 ${highlight ? 'text-blue-600 dark:text-blue-400 text-lg' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
}
