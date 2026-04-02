import LoginForm from '../components/auth/LoginForm';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '40px 16px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
      {/* Grid */}
      <div className="grid-overlay" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 2, animation: 'fadeUp 0.5s ease both' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 11,
              background: 'linear-gradient(135deg,#f97316,#fb923c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
            }}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="white" strokeWidth="2.5" fill="none"/>
                <path d="M16 4V28M4 10L28 22M28 10L4 22" stroke="white" strokeWidth="1.5" opacity="0.45"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, letterSpacing: '0.1em', color: 'var(--text-1)' }}>
              PRINT<span style={{ color: 'var(--accent)' }}>LAB</span>
            </span>
          </Link>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 10 }}>
            Войдите в аккаунт
          </p>
        </div>

        {/* Card */}
        <div className="glass" style={{ borderRadius: 20, padding: '32px 28px', border: '1px solid var(--border-2)' }}>
          <LoginForm />
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-3)' }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
