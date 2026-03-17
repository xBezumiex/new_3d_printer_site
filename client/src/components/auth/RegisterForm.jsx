// Форма регистрации с индикатором силы пароля и показом/скрытием
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function PasswordStrength({ password }) {
  if (!password) return null;

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = [
    { label: 'Очень слабый', color: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
    { label: 'Слабый',       color: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
    { label: 'Средний',      color: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Хороший',      color: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Отличный',     color: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
  ];
  const level = Math.min(strength, 4);

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= level ? levels[level].color : 'bg-gray-200 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${levels[level].text}`}>{levels[level].label}</p>
    </div>
  );
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onChange' });

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...userData } = data;
      await registerUser(userData);
      toast.success('Регистрация успешна! Добро пожаловать!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
      hasError
        ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/10'
        : 'border-gray-300 dark:border-gray-600'
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Имя */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Имя
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          {...register('name', {
            required: 'Имя обязательно',
            minLength: { value: 2, message: 'Минимум 2 символа' },
          })}
          className={inputClass(errors.name)}
          placeholder="Иван Иванов"
        />
        {errors.name && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">⚠ {errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email', {
            required: 'Email обязателен',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Некорректный email адрес',
            },
          })}
          className={inputClass(errors.email)}
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">⚠ {errors.email.message}</p>
        )}
      </div>

      {/* Телефон */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Телефон{' '}
          <span className="text-gray-400 font-normal">(необязательно)</span>
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          {...register('phone', {
            pattern: {
              value: /^[\d\s\-\+\(\)]+$/,
              message: 'Некорректный номер телефона',
            },
          })}
          className={inputClass(errors.phone)}
          placeholder="+7 (XXX) XXX-XX-XX"
        />
        {errors.phone && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">⚠ {errors.phone.message}</p>
        )}
      </div>

      {/* Пароль */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Пароль
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('password', {
              required: 'Пароль обязателен',
              minLength: { value: 6, message: 'Минимум 6 символов' },
            })}
            className={`${inputClass(errors.password)} pr-11`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">⚠ {errors.password.message}</p>
        )}
        <PasswordStrength password={password} />
      </div>

      {/* Подтверждение пароля */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Подтвердите пароль
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: 'Подтверждение пароля обязательно',
              validate: (value) => value === password || 'Пароли не совпадают',
            })}
            className={`${inputClass(errors.confirmPassword)} pr-11`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            tabIndex={-1}
            aria-label={showConfirm ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">⚠ {errors.confirmPassword.message}</p>
        )}
        {!errors.confirmPassword && watch('confirmPassword') && watch('confirmPassword') === password && (
          <p className="mt-1.5 text-sm text-green-600 dark:text-green-400">✓ Пароли совпадают</p>
        )}
      </div>

      {/* Кнопка */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Регистрация...
          </>
        ) : (
          'Зарегистрироваться'
        )}
      </button>

      {/* Ссылка на вход */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
          Войти
        </Link>
      </p>
    </form>
  );
}
