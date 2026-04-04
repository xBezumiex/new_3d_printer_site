import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, ShoppingBag, User, Shield, Sun, Moon, Menu, X, MessageCircle, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getUnreadCount as getUnreadMessages } from '../../api/messages.api.js';
import { getUnreadCount as getUnreadNotifs } from '../../api/notifications.api.js';
import SearchBar from '../search/SearchBar';

const MAIN_LINKS = [
  { to: '/posts',      label: 'Галерея' },
  { to: '/upload',     label: 'Загрузить' },
  { to: '/calculator', label: 'Калькулятор' },
  { to: '/materials',  label: 'Материалы' },
];

const MORE_LINKS = [
  { to: '/courses',  label: 'Курсы' },
  { to: '/about',    label: 'О нас' },
  { to: '/faq',      label: 'FAQ' },
  { to: '/contact',  label: 'Контакты' },
];

function Dropdown({ trigger, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-sm font-medium transition-all duration-200 px-3 py-2"
        style={{ color: open ? 'var(--text-primary)' : 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => !open && (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        {trigger}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-44 py-1 z-50"
          style={{
            background: 'rgba(13,13,24,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative text-sm font-medium transition-all duration-200 px-3 py-2 font-sans ${isActive ? 'active-nav' : ''}`
      }
      style={({ isActive }) => ({
        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
      })}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { if (!e.currentTarget.classList.contains('active-nav')) e.currentTarget.style.color = 'var(--text-muted)'; }}
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && (
            <span
              className="absolute bottom-0 left-3 right-3 h-px"
              style={{ background: 'var(--accent)' }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = () => {
      getUnreadMessages().then(r => setUnreadMessages(r.data?.count || 0)).catch(() => {});
      getUnreadNotifs().then(r => setUnreadNotifs(r.data?.count || 0)).catch(() => {});
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const close = () => setMobileOpen(false);
  const handleLogout = () => { logout(); close(); navigate('/'); };

  const avatar = user?.avatar
    ? <img src={user.avatar} alt="" className="w-7 h-7 object-cover" style={{ border: '1px solid var(--border-strong)' }} />
    : (
      <div
        className="w-7 h-7 flex items-center justify-center text-xs font-bold font-mono"
        style={{ background: 'var(--bg-raised)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }}
      >
        {user?.name?.[0]?.toUpperCase() || '?'}
      </div>
    );

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(8,8,16,0.92)' : 'rgba(8,8,16,0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${scrolled ? 'var(--border-strong)' : 'transparent'}`,
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <nav className="container mx-auto px-6 h-14 flex items-center gap-6">

        {/* Logo */}
        <Link to="/" onClick={close} className="flex items-center gap-2 shrink-0 group mr-2">
          <div
            className="w-7 h-7 flex items-center justify-center font-mono text-xs font-bold transition-colors duration-200"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            3D
          </div>
          <span
            className="font-sans font-semibold text-sm tracking-wider transition-colors duration-200"
            style={{ color: 'var(--text-primary)', letterSpacing: '0.1em' }}
          >
            PRINT LAB
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {MAIN_LINKS.map(({ to, label }) => (
            <NavItem key={to} to={to} label={label} />
          ))}
          <Dropdown trigger={<span className="font-sans text-sm">Ещё</span>}>
            {MORE_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="block px-4 py-2 text-sm font-sans transition-colors duration-150"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-raised)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'transparent'; }}
              >
                {label}
              </Link>
            ))}
          </Dropdown>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <SearchBar className="w-44" />

          <div className="w-px h-4" style={{ background: 'var(--border)' }} />

          {isAuthenticated ? (
            <>
              <NavLink to="/notifications" className="relative p-2 transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-[9px] font-mono font-bold min-w-[14px] h-3.5 flex items-center justify-center px-1"
                    style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                    {unreadNotifs > 99 ? '99+' : unreadNotifs}
                  </span>
                )}
              </NavLink>

              <NavLink to="/chat" className="relative p-2 transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <MessageCircle className="w-4 h-4" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-[9px] font-mono font-bold min-w-[14px] h-3.5 flex items-center justify-center px-1"
                    style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </NavLink>

              {user?.role === 'ADMIN' && (
                <NavLink to="/admin"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-semibold tracking-wider uppercase transition-all duration-200"
                  style={{ border: '1px solid rgba(255,77,0,0.4)', color: 'var(--accent)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Shield className="w-3 h-3" />
                  Адм
                </NavLink>
              )}

              <Dropdown trigger={
                <span className="flex items-center gap-2">
                  {avatar}
                </span>
              }>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-xs font-semibold font-sans truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                  <p className="text-xs font-mono truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                </div>
                <Link to="/profile"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-sans transition-colors duration-150"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-raised)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <User className="w-3.5 h-3.5" /> Профиль
                </Link>
                <Link to="/dashboard"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-sans transition-colors duration-150"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-raised)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Мои заказы
                </Link>
                <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                <button onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-sans transition-colors duration-150"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(255,77,0,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut className="w-3.5 h-3.5" /> Выйти
                </button>
              </Dropdown>
            </>
          ) : (
            <>
              <NavLink to="/login"
                className="text-sm font-sans transition-colors duration-200 px-3 py-2"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Войти
              </NavLink>
              <Link to="/register"
                className="px-4 py-2 text-sm font-sans font-semibold transition-all duration-200 hover:opacity-90"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              >
                Регистрация
              </Link>
            </>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 transition-colors duration-200"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            aria-label="Тема"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile buttons */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
          <button
            onClick={toggleTheme}
            className="p-2 transition-colors duration-200"
            style={{ color: 'var(--text-muted)' }}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="p-2 transition-colors duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden px-6 pb-6 space-y-1"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}
        >
          <div className="pt-4 pb-3">
            <SearchBar className="w-full" onSearch={close} />
          </div>
          {[...MAIN_LINKS, ...MORE_LINKS].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className="block py-2.5 px-3 text-sm font-sans transition-colors duration-150"
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              })}
              onClick={close}
            >
              {label}
            </NavLink>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px' }} />
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin" className="flex items-center gap-2 py-2.5 px-3 text-sm font-mono font-semibold tracking-wider uppercase transition-colors"
                  style={{ color: 'var(--accent)' }} onClick={close}>
                  <Shield className="w-4 h-4" /> Администратор
                </NavLink>
              )}
              <NavLink to="/profile" className="block py-2.5 px-3 text-sm font-sans transition-colors"
                style={{ color: 'var(--text-secondary)' }} onClick={close}>
                {user?.name || 'Профиль'}
              </NavLink>
              <NavLink to="/dashboard" className="block py-2.5 px-3 text-sm font-sans transition-colors"
                style={{ color: 'var(--text-secondary)' }} onClick={close}>
                Мои заказы
              </NavLink>
              <button onClick={handleLogout}
                className="w-full text-left py-2.5 px-3 text-sm font-sans transition-colors"
                style={{ color: 'var(--text-muted)' }}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="block py-2.5 px-3 text-sm font-sans"
                style={{ color: 'var(--text-secondary)' }} onClick={close}>
                Войти
              </NavLink>
              <Link to="/register"
                className="block py-2.5 px-3 text-sm font-sans font-semibold text-center mt-2"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                onClick={close}>
                Зарегистрироваться
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
