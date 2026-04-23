import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ──────────────────────────────────────────────
// SVG иконки
// ──────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

// ──────────────────────────────────────────────
// Хук для открытия OAuth popup
// ──────────────────────────────────────────────
function useOAuthPopup() {
  const popupRef = useRef(null);
  const { loginWithOAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null); // 'google' | 'github' | null

  useEffect(() => {
    const channel = new BroadcastChannel('oauth_channel');

    channel.onmessage = async (event) => {
      setLoading(null);

      if (event.data.type === 'OAUTH_SUCCESS') {
        try {
          await loginWithOAuth(event.data.token, event.data.user);
          toast.success(`Добро пожаловать, ${event.data.user?.name || ''}!`);
          navigate('/dashboard');
        } catch {
          toast.error('Ошибка входа. Попробуйте снова.');
        }
      } else if (event.data.type === 'OAUTH_ERROR') {
        const errorMessages = {
          access_denied: 'Вы отменили авторизацию.',
          oauth_failed:  'Ошибка авторизации. Попробуйте снова.',
          parse_failed:  'Ошибка обработки ответа.',
          no_token:      'Не удалось получить токен.',
        };
        toast.error(errorMessages[event.data.error] || 'Ошибка авторизации.');
      }
    };

    return () => channel.close();
  }, [loginWithOAuth, navigate]);

  const openPopup = (provider) => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }

    const url = `${API_URL.replace('/api', '')}/api/auth/${provider}`;
    const width = 500, height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top  = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      `oauth_${provider}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup || popup.closed) {
      toast.error('Попап заблокирован браузером. Разрешите всплывающие окна для этого сайта.');
      return;
    }

    popupRef.current = popup;
    setLoading(provider);

    // Следим — если пользователь вручную закрыл popup без авторизации
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setLoading(prev => prev === provider ? null : prev);
      }
    }, 500);
  };

  return { openPopup, loading };
}

// ──────────────────────────────────────────────
// Компонент кнопок
// ──────────────────────────────────────────────
export default function OAuthButtons() {
  const { openPopup, loading } = useOAuthPopup();

  const btnStyle = (disabled) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    width: '100%', padding: '11px 14px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10, fontSize: 14,
    color: disabled ? 'var(--text-3)' : 'var(--text-1)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
    transition: 'border-color 0.2s, background 0.2s',
    opacity: disabled ? 0.6 : 1,
  });

  const Spinner = () => (
    <span style={{
      width: 15, height: 15,
      border: '2px solid var(--border)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'rotateSlow 0.8s linear infinite',
      display: 'block', flexShrink: 0,
    }} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Google */}
      <button
        type="button"
        style={btnStyle(loading !== null)}
        disabled={loading !== null}
        onClick={() => openPopup('google')}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = 'var(--accent)'; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        {loading === 'google' ? <Spinner /> : <GoogleIcon />}
        {loading === 'google' ? 'Подождите...' : 'Продолжить с Google'}
      </button>

      {/* GitHub */}
      <button
        type="button"
        style={btnStyle(loading !== null)}
        disabled={loading !== null}
        onClick={() => openPopup('github')}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = 'var(--accent)'; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        {loading === 'github' ? <Spinner /> : <GithubIcon />}
        {loading === 'github' ? 'Подождите...' : 'Продолжить с GitHub'}
      </button>
    </div>
  );
}
