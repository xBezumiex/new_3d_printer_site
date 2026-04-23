import { useEffect } from 'react';

export default function OAuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const user   = params.get('user');
    const error  = params.get('error');

    let result;
    if (error) {
      result = { type: 'OAUTH_ERROR', error };
    } else if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        result = { type: 'OAUTH_SUCCESS', token, user: parsedUser };
      } catch {
        result = { type: 'OAUTH_ERROR', error: 'parse_failed' };
      }
    } else {
      result = { type: 'OAUTH_ERROR', error: 'no_token' };
    }

    // localStorage storage event is guaranteed to fire in other windows/tabs
    localStorage.setItem('oauth_result', JSON.stringify(result));

    // Small delay so the storage event fires before the popup closes
    setTimeout(() => window.close(), 300);
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
