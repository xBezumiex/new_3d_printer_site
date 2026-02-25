// Компонент редактирования профиля
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import * as usersApi from '../../api/users.api';
import { useAuth } from '../../context/AuthContext';

export default function ProfileEdit({ user, onClose, onUpdate }) {
  const { updateUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user.name || '',
      phone: user.phone || '',
      bio: user.bio || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await usersApi.updateUserProfile(user.id, data);
      const updatedUser = response.data.data.user;

      // Обновить пользователя в AuthContext если это текущий пользователь
      updateUser(updatedUser);

      toast.success('Профиль обновлен');
      onUpdate(updatedUser);
      onClose();
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      toast.error(error.response?.data?.message || 'Не удалось обновить профиль');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Редактировать профиль
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Имя */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Имя *
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'Имя обязательно',
                minLength: {
                  value: 2,
                  message: 'Минимум 2 символа',
                },
                maxLength: {
                  value: 100,
                  message: 'Максимум 100 символов',
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ваше имя"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Телефон */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Телефон
            </label>
            <input
              type="tel"
              {...register('phone', {
                pattern: {
                  value: /^[\d\s\-\+\(\)]+$/,
                  message: 'Некорректный номер телефона',
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+7 (XXX) XXX-XX-XX"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Биография */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              О себе
            </label>
            <textarea
              {...register('bio', {
                maxLength: {
                  value: 500,
                  message: 'Максимум 500 символов',
                },
              })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Расскажите о себе..."
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.bio.message}
              </p>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
