import { Link, useNavigate } from 'react-router-dom';
import { Home, Upload, Calculator, BookOpen, Image, HelpCircle, Mail, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

const LINKS = [
  { to: '/',           icon: Home,       label: 'Главная',          color: '#4F8EF7' },
  { to: '/upload',     icon: Upload,     label: 'Загрузить модель', color: '#C084FC' },
  { to: '/calculator', icon: Calculator, label: 'Калькулятор',      color: '#4ADE80' },
  { to: '/posts',      icon: Image,      label: 'Галерея работ',    color: '#FF4D00' },
  { to: '/courses',    icon: BookOpen,   label: 'Курсы',            color: '#FACC15' },
  { to: '/faq',        icon: HelpCircle, label: 'FAQ',              color: '#38BDF8' },
  { to: '/contact',    icon: Mail,       label: 'Контакты',         color: '#FB923C' },
];

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [count, setCount] = useState(10);

  useEffect(() => {
    const t = setInterval(() => setCount(c => c - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (count <= 0) navigate('/');
  }, [count, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 mesh-bg grid-overlay" style={{ background: 'var(--bg)' }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,77,0,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div className="text-center max-w-2xl w-full relative z-10">
        {/* 404 */}
        <div className="relative mb-8 select-none">
          <p className="font-display leading-none" style={{
            fontSize: 'clamp(8rem,20vw,14rem)',
            WebkitTextStroke: '1px rgba(255,77,0,0.2)',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.05em',
          }}>
            404
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="glass px-6 py-3">
              <p className="font-display tracking-widest text-xl" style={{ color: 'var(--text-primary)' }}>
                СТРАНИЦА НЕ НАЙДЕНА
              </p>
            </div>
          </div>
        </div>

        <p className="font-sans text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <p className="font-mono text-xs mb-10" style={{ color: 'var(--text-muted)' }}>
          Переход на главную через <span style={{ color: 'var(--accent)' }}>{count}</span> сек.
        </p>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {LINKS.map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to}
              className="glass glass-hover flex flex-col items-center gap-2 p-4 transition-all duration-200 group">
              <Icon className="w-5 h-5 transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = color}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              />
              <span className="font-mono text-[10px] tracking-wider text-center leading-tight"
                style={{ color: 'var(--text-secondary)' }}>
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => navigate(-1)}
            className="glass btn-ghost inline-flex items-center gap-2 px-6 py-3 font-sans font-medium transition-colors"
            style={{ border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>
          <Link to="/"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3 font-sans font-semibold"
            style={{ background: 'var(--accent)', color: '#000' }}>
            <Home className="w-4 h-4" /> На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
