import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallbackPage() {
  const { loginWithOAuth } = useAuth();
  const navigate = useNavigate();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const user  = params.get('user');
    const error = params.get('error');

    if (error) {
      const msgs = {
        access_denied: 'Вы отменили авторизацию.',
        oauth_failed:  'Ошибка авторизации. Попробуйте снова.',
        parse_failed:  'Ошибка обработки ответа.',
        no_token:      'Не удалось получить токен.',
      };
      toast.error(msgs[error] || 'Ошибка авторизации.');
      navigate('/login', { replace: true });
      return;
    }

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        loginWithOAuth(token, parsedUser).then(() => {
          toast.success(`Добро пожаловать, ${parsedUser.name || ''}!`);
          navigate('/dashboard', { replace: true });
        });
      } catch {
        toast.error('Ошибка обработки ответа.');
        navigate('/login', { replace: true });
      }
    } else {
      toast.error('Не удалось получить токен.');
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', color: 'var(--text-1)',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{
        width: 40, height: 40, border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', marginBottom: 16,
      }} />
      <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Авторизация...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
