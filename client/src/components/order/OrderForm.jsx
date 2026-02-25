// Форма оформления заказа
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useModel } from '../../context/ModelContext';
import { useAuth } from '../../context/AuthContext';
import * as ordersApi from '../../api/orders.api';

export default function OrderForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { modelLoaded, modelData, calcParams, price, materials, qualities } = useModel();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      comments: '',
    },
  });

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
        price: parseFloat(price),
        comments: data.comments || null,
      };

      await ordersApi.createOrder(orderData);

      toast.success('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.');
      reset();
      navigate('/dashboard');
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      toast.error(error.message || 'Ошибка при оформлении заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Оформление заказа
      </h3>

      {!modelLoaded && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-300">
            Пожалуйста, сначала загрузите 3D модель и рассчитайте стоимость
          </p>
        </div>
      )}

      {/* Детали заказа */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          Детали заказа:
        </h4>
        <div className="space-y-1 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            Материал: {materials[calcParams.material].name}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Качество: {qualities[calcParams.quality].name}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Заполнение: {calcParams.infill}%
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Количество: {calcParams.quantity} шт.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Объем: {calcParams.volume} см³
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Вес: {calcParams.weight} г
          </p>
          {modelData?.fileName && (
            <p className="text-gray-700 dark:text-gray-300">
              Файл: {modelData.fileName}
            </p>
          )}
        </div>
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-3">
          Стоимость: {price} ₽
        </p>
      </div>

      {/* Форма */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Имя */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Имя *
          </label>
          <input
            type="text"
            {...register('name', { required: 'Имя обязательно' })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Иван Иванов"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
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
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ivan@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Телефон */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Телефон *
          </label>
          <input
            type="tel"
            {...register('phone', { required: 'Телефон обязателен' })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+7 (999) 123-45-67"
            disabled={isSubmitting}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
          )}
        </div>

        {/* Комментарий */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Комментарий к заказу
          </label>
          <textarea
            {...register('comments')}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 h-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Дополнительные пожелания, адрес доставки..."
            disabled={isSubmitting}
          />
        </div>

        {/* Кнопка отправки */}
        <button
          type="submit"
          disabled={!modelLoaded || isSubmitting}
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${
            modelLoaded && !isSubmitting
              ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Оформление...' : `Оформить заказ на ${price} ₽`}
        </button>
      </form>

      {/* Дополнительная информация */}
      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400 space-y-2">
        <p>* После оформления заказа мы свяжемся с вами в течение 1 часа для подтверждения деталей.</p>
        <p>* Срок изготовления: 24-48 часов с момента подтверждения.</p>
      </div>
    </div>
  );
}
