// Компонент редактирования профиля + смена пароля
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import * as usersApi from '../../api/users.api';
import * as authApi from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';

export default function ProfileEdit({ user, onClose, onUpdate }) {
  const { updateUser } = useAuth();
  const [tab, setTab] = useState('profile'); // 'profile' | 'password'
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: user.name || '', phone: user.phone || '', bio: user.bio || '' },
  });

  const { register: regPwd, handleSubmit: handlePwd, formState: { errors: pwdErrors, isSubmitting: pwdSubmitting }, watch, reset: resetPwd } = useForm();

  const onSubmitProfile = async (data) => {
    try {
      const response = await usersApi.updateUserProfile(user.id, data);
      const updatedUser = response.data?.data?.user || response.data?.user;
      updateUser(updatedUser);
      toast.success('Профиль обновлён');
      onUpdate(updatedUser);
      onClose();
    } catch (e) {
      toast.error(e?.message || 'Не удалось обновить профиль');
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Пароль успешно изменён');
      resetPwd();
      setTab('profile');
    } catch (e) {
      toast.error(e?.message || 'Неверный текущий пароль');
    }
  };

  const inputCls = 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Редактировать профиль</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Табы */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[['profile', 'Профиль'], ['password', 'Пароль']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-3 text-sm font-medium transition ${tab === key
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>
              {key === 'password' && <Lock className="w-4 h-4 inline mr-1" />}{label}
            </button>
          ))}
        </div>

        {/* Форма профиля */}
        {tab === 'profile' && (
          <form onSubmit={handleSubmit(onSubmitProfile)} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имя *</label>
              <input type="text" {...register('name', { required: 'Имя обязательно', minLength: { value: 2, message: 'Минимум 2 символа' } })}
                className={inputCls} placeholder="Ваше имя" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Телефон</label>
              <input type="tel" {...register('phone', { pattern: { value: /^[\d\s\-\+\(\)]+$/, message: 'Некорректный номер' } })}
                className={inputCls} placeholder="+7 (XXX) XXX-XX-XX" />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">О себе</label>
              <textarea {...register('bio', { maxLength: { value: 500, message: 'Максимум 500 символов' } })}
                rows={4} className={inputCls + ' resize-none'} placeholder="Расскажите о себе..." />
              {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Отмена
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition">
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        )}

        {/* Форма пароля */}
        {tab === 'password' && (
          <form onSubmit={handlePwd(onSubmitPassword)} className="p-6 space-y-4">
            {[
              { id: 'currentPassword', label: 'Текущий пароль', show: showCurrent, toggle: () => setShowCurrent(v => !v), ref: regPwd('currentPassword', { required: 'Введите текущий пароль' }), err: pwdErrors.currentPassword },
              { id: 'newPassword', label: 'Новый пароль', show: showNew, toggle: () => setShowNew(v => !v), ref: regPwd('newPassword', { required: 'Введите новый пароль', minLength: { value: 6, message: 'Минимум 6 символов' } }), err: pwdErrors.newPassword },
              { id: 'confirmPassword', label: 'Подтвердите пароль', show: showConfirm, toggle: () => setShowConfirm(v => !v), ref: regPwd('confirmPassword', { required: 'Подтвердите пароль', validate: v => v === watch('newPassword') || 'Пароли не совпадают' }), err: pwdErrors.confirmPassword },
            ].map(({ id, label, show, toggle, ref, err }) => (
              <div key={id}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} {...ref}
                    className={inputCls + ' pr-10'} placeholder="••••••••" />
                  <button type="button" onClick={toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {err && <p className="mt-1 text-sm text-red-600">{err.message}</p>}
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Отмена
              </button>
              <button type="submit" disabled={pwdSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition">
                {pwdSubmitting ? 'Сохранение...' : 'Изменить пароль'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
