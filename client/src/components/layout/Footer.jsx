import { Link } from 'react-router-dom';

const NAV = [
  { to: '/upload',     label: 'Загрузить модель' },
  { to: '/calculator', label: 'Калькулятор' },
  { to: '/materials',  label: 'Материалы' },
  { to: '/posts',      label: 'Галерея работ' },
];

const INFO = [
  { to: '/courses', label: 'Курсы' },
  { to: '/about',   label: 'О нас' },
  { to: '/faq',     label: 'FAQ' },
  { to: '/contact', label: 'Контакты' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/4 w-96 h-48 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,77,0,0.04) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute top-0 right-1/3 w-64 h-32 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(79,142,247,0.03) 0%, transparent 70%)', filter: 'blur(30px)' }} />
      <div className="container mx-auto px-6 py-16">

        {/* Top row */}
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-16">

          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 flex items-center justify-center font-mono text-xs font-bold"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                3D
              </div>
              <span className="font-sans font-semibold text-sm tracking-widest" style={{ color: 'var(--text-primary)' }}>
                PRINT LAB
              </span>
            </div>
            <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Профессиональная 3D-печать любой сложности. Качественно, быстро, по честной цене.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
              <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                Москва · Работаем с 2019
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
            <div>
              <p className="font-mono text-xs tracking-widest2 uppercase mb-5" style={{ color: 'var(--text-muted)' }}>
                Услуги
              </p>
              <ul className="space-y-3">
                {NAV.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="font-sans text-sm transition-colors duration-150"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs tracking-widest2 uppercase mb-5" style={{ color: 'var(--text-muted)' }}>
                Компания
              </p>
              <ul className="space-y-3">
                {INFO.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="font-sans text-sm transition-colors duration-150"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-xs tracking-widest2 uppercase mb-5" style={{ color: 'var(--text-muted)' }}>
                Контакты
              </p>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:i43231360@gmail.com" className="font-sans text-sm transition-colors duration-150"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                    i43231360@gmail.com
                  </a>
                </li>
                <li className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
                  +7 (XXX) XXX-XX-XX
                </li>
                <li className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
                  г. Москва
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid var(--border)' }}>
          <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            © {year} 3D Print Lab. Все права защищены.
          </p>
          <div className="flex items-center gap-1">
            {['FDM', 'SLA', 'PLA', 'ABS', 'PETG'].map((tag, i) => (
              <span key={tag} className="font-mono text-[10px] px-2 py-0.5 tracking-wider"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
