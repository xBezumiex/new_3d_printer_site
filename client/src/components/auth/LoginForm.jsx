import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OAuthButtons from './OAuthButtons';

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

const Divider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      или
    </span>
    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
  </div>
);

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ mode: 'onChange' });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast.success('Добро пожаловать!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Ошибка входа. Проверьте данные.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* OAuth кнопки */}
      <OAuthButtons />

      <Divider />

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Email */}
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email" autoComplete="email"
            placeholder="your@email.com"
            {...register('email', {
              required: 'Email обязателен',
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Некорректный email' },
            })}
            style={inputStyle(errors.email)}
            onFocus={e => { if (!errors.email) e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={e => { if (!errors.email) e.target.style.borderColor = 'var(--border)'; }}
          />
          {errors.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, color: '#f87171', fontSize: 12 }}>
              <AlertCircle size={12} /> {errors.email.message}
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <label style={labelStyle}>Пароль</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Пароль обязателен',
                minLength: { value: 6, message: 'Минимум 6 символов' },
              })}
              style={{ ...inputStyle(errors.password), paddingRight: 42 }}
              onFocus={e => { if (!errors.password) e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={e => { if (!errors.password) e.target.style.borderColor = 'var(--border)'; }}
            />
            <button
              type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', padding: 2 }}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, color: '#f87171', fontSize: 12 }}>
              <AlertCircle size={12} /> {errors.password.message}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={isSubmitting}
          style={{
            width: '100%', padding: '13px 0',
            background: isSubmitting ? 'rgba(249,115,22,0.5)' : 'var(--accent)',
            color: '#fff', fontWeight: 700, fontSize: 15,
            borderRadius: 10, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 20px var(--accent-glow)',
            transition: 'background 0.2s, box-shadow 0.2s',
            fontFamily: 'DM Sans, sans-serif',
          }}
          onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = '#ea580c'; }}
          onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = 'var(--accent)'; }}
        >
          {isSubmitting ? (
            <>
              <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'rotateSlow 0.8s linear infinite', display: 'block' }} />
              Выполняется вход...
            </>
          ) : 'Войти'}
        </button>
      </form>
    </div>
  );
}
