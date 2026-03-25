// Форма оформления заказа с валидацией в реальном времени
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckCircle, Tag, X } from 'lucide-react';
import { useModel } from '../../context/ModelContext';
import { useAuth } from '../../context/AuthContext';
import * as ordersApi from '../../api/orders.api';
import { validatePromo } from '../../api/promo.api.js';

export default function OrderForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { modelLoaded, modelData, calcParams, price, materials, qualities } = useModel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null); // { code, discount }
  const [promoLoading, setPromoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      comments: '',
    },
  });

  const finalPrice = promoApplied
    ? Math.round(parseFloat(price) * (1 - promoApplied.discount / 100))
    : parseFloat(price);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await validatePromo(promoCode.trim());
      setPromoApplied(res.data);
      toast.success(`Промокод применён: −${res.data.discount}%`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Промокод не найден');
    } finally {
      setPromoLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!modelLoaded) {
      toast.error('Пожалуйста, сначала загрузите 3D модель');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        modelFile: modelData?.fileName || null,
        material: calcParams.material,
        quality: calcParams.quality,
        infill: calcParams.infill,
        quantity: calcParams.quantity,
        volume: parseFloat(calcParams.volume),
        weight: parseFloat(calcParams.weight),
        price: finalPrice,
        promoCode: promoApplied?.code || null,
        comments: data.comments || null,
      };

      await ordersApi.createOrder(orderData);
      setSubmitted(true);
      toast.success('Заказ успешно оформлен!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      toast.error(error.message || 'Ошибка при оформлении заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full border rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      hasError
        ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/10'
        : 'border-gray-300 dark:border-gray-600'
    }`;

  if (submitted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Заказ оформлен!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2">Мы свяжемся с вами в ближайшее время</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Переход в личный кабинет...</p>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Оформление заказа
      </h3>

      {!modelLoaded && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-start gap-3">
          <span className="text-red-500 text-lg shrink-0">⚠</span>
          <p className="text-red-800 dark:text-red-300 text-sm">
            Пожалуйста, сначала{' '}
            <a href="#upload" className="underline font-medium">загрузите 3D модель</a>{' '}
            и рассчитайте стоимость
          </p>
        </div>
      )}

      {/* Детали заказа */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-5 mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">✓</span>
          Детали заказа
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <span className="text-gray-500 dark:text-gray-400">Материал:</span>
          <span className="font-medium text-gray-900 dark:text-white">{materials[calcParams.material].name}</span>
          <span className="text-gray-500 dark:text-gray-400">Качество:</span>
          <span className="font-medium text-gray-900 dark:text-white">{qualities[calcParams.quality].name}</span>
          <span className="text-gray-500 dark:text-gray-400">Заполнение:</span>
          <span className="font-medium text-gray-900 dark:text-white">{calcParams.infill}%</span>
          <span className="text-gray-500 dark:text-gray-400">Количество:</span>
          <span className="font-medium text-gray-900 dark:text-white">{calcParams.quantity} шт.</span>
          <span className="text-gray-500 dark:text-gray-400">Объём / Вес:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {calcParams.volume} см³ / {calcParams.weight} г
          </span>
          {modelData?.fileName && (
            <>
              <span className="text-gray-500 dark:text-gray-400">Файл:</span>
              <span className="font-medium text-gray-900 dark:text-white truncate">{modelData.fileName}</span>
            </>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
          {promoApplied && (
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500 dark:text-gray-400">Без скидки:</span>
              <span className="line-through text-gray-400">{price} ₽</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700 dark:text-gray-300">Итого:</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{finalPrice} ₽</span>
          </div>
        </div>
      </div>

      {/* Форма */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Имя */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Имя *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Имя обязательно', minLength: { value: 2, message: 'Минимум 2 символа' } })}
            className={inputClass(errors.name)}
            placeholder="Иван Иванов"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">⚠ {errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Email *
          </label>
          <input
            type="email"
            {...register('email', {
              required: 'Email обязателен',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Некорректный email',
              },
            })}
            className={inputClass(errors.email)}
            placeholder="ivan@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">⚠ {errors.email.message}</p>
          )}
        </div>

        {/* Телефон */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Телефон *
          </label>
          <input
            type="tel"
            {...register('phone', {
              required: 'Телефон обязателен',
              pattern: {
                value: /^[\d\s\-\+\(\)]{7,}$/,
                message: 'Некорректный номер телефона',
              },
            })}
            className={inputClass(errors.phone)}
            placeholder="+7 (999) 123-45-67"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">⚠ {errors.phone.message}</p>
          )}
        </div>

        {/* Комментарий */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Комментарий к заказу
          </label>
          <textarea
            {...register('comments')}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 h-28 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
            placeholder="Дополнительные пожелания, адрес доставки, особые требования..."
            disabled={isSubmitting}
          />
        </div>

        {/* Промокод */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Промокод
          </label>
          {promoApplied ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <Tag className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400 flex-1">{promoApplied.code} — скидка {promoApplied.discount}%</span>
              <button type="button" onClick={() => setPromoApplied(null)}
                className="text-green-600 dark:text-green-400 hover:text-green-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Введите промокод..."
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              />
              <button type="button" onClick={applyPromo} disabled={!promoCode.trim() || promoLoading}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition disabled:opacity-50">
                {promoLoading ? '...' : 'Применить'}
              </button>
            </div>
          )}
        </div>

        {/* Кнопка отправки */}
        <button
          type="submit"
          disabled={!modelLoaded || isSubmitting}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
            modelLoaded && !isSubmitting
              ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg cursor-pointer'
              : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Оформление заказа...
            </>
          ) : (
            `Оформить заказ — ${price} ₽`
          )}
        </button>
      </form>

      {/* Дополнительная информация */}
      <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
        <p className="flex items-start gap-2">
          <span className="text-blue-500 shrink-0">ℹ</span>
          После оформления мы свяжемся с вами в течение 1 часа для подтверждения
        </p>
        <p className="flex items-start gap-2">
          <span className="text-blue-500 shrink-0">🕐</span>
          Срок изготовления: 24–48 часов с момента подтверждения
        </p>
      </div>
    </div>
  );
}
