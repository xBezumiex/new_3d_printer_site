import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const inputStyle = (hasError) => ({
  width: '100%', padding: '11px 14px',
  background: 'var(--surface)',
  border: `1px solid ${hasError ? 'rgba(239,68,68,0.6)' : 'var(--border)'}`,
  borderRadius: 10, fontSize: 14, color: 'var(--text-1)',
  outline: 'none', fontFamily: 'DM Sans, sans-serif',
  transition: 'border-color 0.2s',
});

const labelStyle = {
  display: 'block', fontFamily: 'DM Mono, monospace',
  fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase',
  color: 'var(--text-3)', marginBottom: 8,
};

function PasswordStrength({ password }) {
  if (!password) return null;
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const level = Math.min(strength, 4);
  const colors = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e'];
  const labels = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Отличный'];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= level ? colors[level] : 'var(--surface)',
            transition: 'background 0.3s ease',
            boxShadow: i <= level ? `0 0 6px ${colors[level]}60` : 'none',
          }} />
        ))}
      </div>
      <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: colors[level], letterSpacing: '0.05em' }}>{labels[level]}</p>
    </div>
  );
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ mode: 'onChange' });
  const password = watch('password', '');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...userData } = data;
      await registerUser(userData);
      toast.success('Добро пожаловать в PrintLab!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ErrorMsg = ({ error }) => error ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, color: '#f87171', fontSize: 12 }}>
      <AlertCircle size={12} /> {error.message}
    </div>
  ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Name */}
      <div>
        <label style={labelStyle}>Имя</label>
        <input
          type="text" autoComplete="name" placeholder="Иван Иванов"
          {...register('name', { required: 'Имя обязательно', minLength: { value: 2, message: 'Минимум 2 символа' } })}
          style={inputStyle(errors.name)}
          onFocus={e => { if (!errors.name) e.target.style.borderColor = 'var(--accent)'; }}
          onBlur={e => { if (!errors.name) e.target.style.borderColor = 'var(--border)'; }}
        />
        <ErrorMsg error={errors.name} />
      </div>

      {/* Email */}
      <div>
        <label style={labelStyle}>Email</label>
        <input
          type="email" autoComplete="email" placeholder="your@email.com"
          {...register('email', {
            required: 'Email обязателен',
            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Некорректный email' },
          })}
          style={inputStyle(errors.email)}
          onFocus={e => { if (!errors.email) e.target.style.borderColor = 'var(--accent)'; }}
          onBlur={e => { if (!errors.email) e.target.style.borderColor = 'var(--border)'; }}
        />
        <ErrorMsg error={errors.email} />
      </div>

      {/* Phone */}
      <div>
        <label style={{ ...labelStyle }}>
          Телефон <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(необязательно)</span>
        </label>
        <input
          type="tel" autoComplete="tel" placeholder="+7 (XXX) XXX-XX-XX"
          {...register('phone', { pattern: { value: /^[\d\s\-\+\(\)]+$/, message: 'Некорректный номер' } })}
          style={inputStyle(errors.phone)}
          onFocus={e => { if (!errors.phone) e.target.style.borderColor = 'var(--accent)'; }}
          onBlur={e => { if (!errors.phone) e.target.style.borderColor = 'var(--border)'; }}
        />
        <ErrorMsg error={errors.phone} />
      </div>

      {/* Password */}
      <div>
        <label style={labelStyle}>Пароль</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••"
            {...register('password', { required: 'Пароль обязателен', minLength: { value: 6, message: 'Минимум 6 символов' } })}
            style={{ ...inputStyle(errors.password), paddingRight: 42 }}
            onFocus={e => { if (!errors.password) e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={e => { if (!errors.password) e.target.style.borderColor = 'var(--border)'; }}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', padding: 2 }}>
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <ErrorMsg error={errors.password} />
        <PasswordStrength password={password} />
      </div>

      {/* Confirm password */}
      <div>
        <label style={labelStyle}>Подтвердите пароль</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showConfirm ? 'text' : 'password'} autoComplete="new-password" placeholder="••••••••"
            {...register('confirmPassword', {
              required: 'Подтверждение обязательно',
              validate: v => v === password || 'Пароли не совпадают',
            })}
            style={{ ...inputStyle(errors.confirmPassword), paddingRight: 42 }}
            onFocus={e => { if (!errors.confirmPassword) e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={e => { if (!errors.confirmPassword) e.target.style.borderColor = 'var(--border)'; }}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', padding: 2 }}>
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <ErrorMsg error={errors.confirmPassword} />
        {!errors.confirmPassword && watch('confirmPassword') && watch('confirmPassword') === password && (
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#22c55e', marginTop: 6, letterSpacing: '0.05em' }}>✓ Пароли совпадают</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit" disabled={isSubmitting}
        style={{
          marginTop: 4, width: '100%', padding: '13px 0',
          background: isSubmitting ? 'rgba(249,115,22,0.5)' : 'var(--accent)',
          color: '#fff', fontWeight: 700, fontSize: 15,
          borderRadius: 10, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 20px var(--accent-glow)',
          transition: 'background 0.2s',
          fontFamily: 'DM Sans, sans-serif',
        }}
        onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = '#ea580c'; }}
        onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = 'var(--accent)'; }}
      >
        {isSubmitting ? (
          <>
            <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rotateSlow 0.8s linear infinite', display: 'block' }} />
            Регистрация...
          </>
        ) : 'Зарегистрироваться'}
      </button>
    </form>
  );
}
