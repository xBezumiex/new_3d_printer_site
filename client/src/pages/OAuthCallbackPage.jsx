// Страница-посредник для OAuth popup
// Открывается в popup-окне, извлекает token из URL,
// передаёт его родительскому окну и закрывается
import { useEffect } from 'react';

export default function OAuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const user   = params.get('user');
    const error  = params.get('error');

    if (window.opener && !window.opener.closed) {
      if (error) {
        window.opener.postMessage({ type: 'OAUTH_ERROR', error }, window.location.origin);
      } else if (token && user) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(user));
          window.opener.postMessage({ type: 'OAUTH_SUCCESS', token, user: parsedUser }, window.location.origin);
        } catch {
          window.opener.postMessage({ type: 'OAUTH_ERROR', error: 'parse_failed' }, window.location.origin);
        }
      } else {
        window.opener.postMessage({ type: 'OAUTH_ERROR', error: 'no_token' }, window.location.origin);
      }
      window.close();
    } else {
      // Если попали сюда без popup (прямой переход) — редиректим на главную
      window.location.href = '/';
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
