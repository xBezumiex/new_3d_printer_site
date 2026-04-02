import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
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
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 13, fontWeight: 500,
          color: 'var(--text-2)',
          padding: '5px 10px',
          borderRadius: 8,
          transition: 'color 0.15s, background 0.15s',
          background: 'transparent',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.background = 'var(--surface)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent'; }}
      >
        {trigger}
        <ChevronDown style={{ width: 13, height: 13, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {open && (
        <div
          className="glass"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: 176, borderRadius: 12,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            padding: '4px 0', zIndex: 50,
            animation: 'fadeUp 0.2s ease both',
          }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{ display: 'block', padding: '8px 16px', fontSize: 13, color: 'var(--text-2)', transition: 'color 0.15s, background 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--surface)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </Link>
  );
}

function NavItem({ to, label }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <NavLink
      to={to}
      style={{
        position: 'relative', fontSize: 13, fontWeight: 500,
        color: isActive ? 'var(--text-1)' : 'var(--text-2)',
        padding: '5px 10px', borderRadius: 8,
        transition: 'color 0.15s',
        textDecoration: 'none',
      }}
    >
      {label}
      {isActive && (
        <span style={{
          position: 'absolute', bottom: -1, left: 10, right: 10,
          height: 2, borderRadius: 2,
          background: 'var(--accent)',
          boxShadow: '0 0 8px var(--accent-glow)',
        }} />
      )}
    </NavLink>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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
    ? <img src={user.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-2)' }} />
    : (
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent), #fb923c)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: '#fff',
        border: '1.5px solid var(--border-2)',
        fontFamily: 'DM Mono, monospace',
      }}>
        {user?.name?.[0]?.toUpperCase() || '?'}
      </div>
    );

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(10,10,15,0.85)' : 'rgba(10,10,15,0.6)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
        transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {/* macOS traffic lights row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', display: 'block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', display: 'block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', display: 'block' }} />
        <span style={{ marginLeft: 'auto', fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em' }}>3D PRINT LAB</span>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', height: 46, maxWidth: 1280, margin: '0 auto' }}>

        {/* Logo */}
        <Link to="/" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0, marginRight: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg,#f97316,#fb923c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(249,115,22,0.4)',
          }}>
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="white" strokeWidth="2.5" fill="none"/>
              <path d="M16 4V28M4 10L28 22M28 10L4 22" stroke="white" strokeWidth="1.5" opacity="0.45"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: '0.08em', color: 'var(--text-1)' }}>
            PRINT<span style={{ color: 'var(--accent)' }}>LAB</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 2, flex: 1 }}>
          {MAIN_LINKS.map(({ to, label }) => <NavItem key={to} to={to} label={label} />)}
          <Dropdown trigger="Ещё">
            {MORE_LINKS.map(({ to, label }) => <DropdownItem key={to} to={to}>{label}</DropdownItem>)}
          </Dropdown>
        </div>

        {/* Right side */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <SearchBar className="w-40" />

          <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }} />

          {isAuthenticated ? (
            <>
              <NavLink to="/notifications" style={{ position: 'relative', padding: 6, color: 'var(--text-3)', borderRadius: 8, display: 'flex', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                <Bell size={16} />
                {unreadNotifs > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    background: 'var(--accent)', color: '#fff',
                    fontSize: 9, fontWeight: 700, fontFamily: 'DM Mono, monospace',
                    borderRadius: '50%', minWidth: 14, height: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px',
                  }}>
                    {unreadNotifs > 99 ? '99+' : unreadNotifs}
                  </span>
                )}
              </NavLink>

              <NavLink to="/chat" style={{ position: 'relative', padding: 6, color: 'var(--text-3)', borderRadius: 8, display: 'flex', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
              >
                <MessageCircle size={16} />
                {unreadMessages > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    background: 'var(--accent)', color: '#fff',
                    fontSize: 9, fontWeight: 700, fontFamily: 'DM Mono, monospace',
                    borderRadius: '50%', minWidth: 14, height: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px',
                  }}>
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </NavLink>

              {user?.role === 'ADMIN' && (
                <NavLink to="/admin" style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 7,
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#f87171', fontSize: 11, fontWeight: 600,
                  fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em',
                  textDecoration: 'none',
                }}>
                  <Shield size={12} /> ADMIN
                </NavLink>
              )}

              <Dropdown trigger={<span style={{ display: 'flex', alignItems: 'center' }}>{avatar}</span>}>
                <div style={{ padding: '8px 16px 8px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'DM Mono, monospace' }}>{user?.email}</p>
                </div>
                <DropdownItem to="/profile"><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User size={13} /> Профиль</span></DropdownItem>
                <DropdownItem to="/dashboard"><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShoppingBag size={13} /> Мои заказы</span></DropdownItem>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '8px 16px',
                    fontSize: 13, color: '#f87171',
                    background: 'transparent', cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={13} /> Выйти
                </button>
              </Dropdown>
            </>
          ) : (
            <>
              <NavLink to="/login" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', textDecoration: 'none', padding: '5px 10px', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
              >
                Войти
              </NavLink>
              <Link to="/register" style={{
                padding: '6px 14px', borderRadius: 8,
                background: 'var(--accent)',
                color: '#fff', fontSize: 13, fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 2px 12px var(--accent-glow)',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#ea580c'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; }}
              >
                Регистрация
              </Link>
            </>
          )}

          <button
            onClick={toggleTheme}
            style={{
              padding: 6, borderRadius: 8,
              color: 'var(--text-3)', background: 'transparent',
              display: 'flex', cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            aria-label="Тема"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {/* Mobile buttons */}
        <div className="md:hidden" style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <button onClick={toggleTheme} style={{ padding: 6, color: 'var(--text-3)', display: 'flex', background: 'transparent', cursor: 'pointer' }}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => setMobileOpen(v => !v)}
            style={{ padding: 6, color: 'var(--text-2)', display: 'flex', background: 'transparent', cursor: 'pointer' }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass" style={{ borderTop: '1px solid var(--border)', padding: '12px 16px 16px' }}>
          <div style={{ paddingBottom: 10 }}>
            <SearchBar className="w-full" onSearch={close} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...MAIN_LINKS, ...MORE_LINKS].map(({ to, label }) => (
              <NavLink key={to} to={to} onClick={close}
                style={({ isActive }) => ({
                  display: 'block', padding: '9px 12px', borderRadius: 8,
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--accent)' : 'var(--text-2)',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                {label}
              </NavLink>
            ))}
          </div>
          <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#f87171', textDecoration: 'none' }}>
                  <Shield size={14} /> Панель администратора
                </NavLink>
              )}
              <NavLink to="/profile" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, fontSize: 14, color: 'var(--text-2)', textDecoration: 'none' }}>
                <User size={14} /> {user?.name || 'Профиль'}
              </NavLink>
              <NavLink to="/dashboard" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, fontSize: 14, color: 'var(--text-2)', textDecoration: 'none' }}>
                <ShoppingBag size={14} /> Мои заказы
              </NavLink>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, fontSize: 14, color: '#f87171', background: 'transparent', cursor: 'pointer', width: '100%' }}>
                <LogOut size={14} /> Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close} style={{ display: 'block', padding: '9px 12px', borderRadius: 8, fontSize: 14, color: 'var(--text-2)', textDecoration: 'none' }}>Войти</NavLink>
              <Link to="/register" onClick={close} style={{ display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: 'var(--accent)', color: '#fff', textAlign: 'center', textDecoration: 'none', marginTop: 4 }}>
                Зарегистрироваться
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
