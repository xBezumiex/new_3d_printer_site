import { Link } from 'react-router-dom';

const NAV_COLS = [
  {
    title: 'Сервис',
    links: [
      { to: '/upload',     label: 'Загрузить модель' },
      { to: '/calculator', label: 'Калькулятор' },
      { to: '/materials',  label: 'Материалы' },
      { to: '/posts',      label: 'Галерея работ' },
    ],
  },
  {
    title: 'Компания',
    links: [
      { to: '/about',   label: 'О нас' },
      { to: '/courses', label: 'Курсы' },
      { to: '/faq',     label: 'FAQ' },
      { to: '/contact', label: 'Контакты' },
    ],
  },
  {
    title: 'Аккаунт',
    links: [
      { to: '/login',     label: 'Войти' },
      { to: '/register',  label: 'Регистрация' },
      { to: '/dashboard', label: 'Мои заказы' },
      { to: '/profile',   label: 'Профиль' },
    ],
  },
];

const TECH_TAGS = ['FDM', 'SLA', 'PLA', 'ABS', 'PETG', 'TPU', 'Nylon', 'G-code', 'STL', 'OBJ'];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glows */}
      <div style={{
        position: 'absolute', top: 0, left: '10%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: '15%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 24px 0' }}>
        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, auto)', gap: 48, paddingBottom: 48, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>

          {/* Brand block */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'linear-gradient(135deg,#f97316,#fb923c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
              }}>
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="white" strokeWidth="2.5" fill="none"/>
                  <path d="M16 4V28M4 10L28 22M28 10L4 22" stroke="white" strokeWidth="1.5" opacity="0.45"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: '0.1em', color: 'var(--text-1)' }}>
                PRINT<span style={{ color: 'var(--accent)' }}>LAB</span>
              </span>
            </Link>
            <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 240, marginBottom: 20 }}>
              Профессиональная 3D-печать в Москве.<br />
              Быстро, точно, по честной цене.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Email', value: 'i43231360@gmail.com' },
                { label: 'Телефон', value: '+7 (XXX) XXX-XX-XX' },
                { label: 'Адрес', value: 'г. Москва' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 1, minWidth: 50 }}>{label}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map(col => (
            <div key={col.title}>
              <h3 style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
                {col.title}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tech tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '24px 0 20px' }}>
          {TECH_TAGS.map(tag => (
            <span
              key={tag}
              style={{
                fontFamily: 'DM Mono, monospace',
                fontSize: 10, letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-3)',
                padding: '4px 10px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.05em' }}>
            © {year} 3D Print Lab — Все права защищены
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'block', animation: 'pulseDot 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em' }}>ONLINE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
