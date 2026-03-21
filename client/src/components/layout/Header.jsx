import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, ShoppingBag, User, Shield, Sun, Moon, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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

const linkCls = ({ isActive }) =>
  `text-sm font-medium transition-all whitespace-nowrap px-3 py-1.5 rounded-lg ${isActive
    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'}`;

const mobileLinkCls = ({ isActive }) =>
  `block py-2.5 px-3 rounded-lg text-sm transition-colors ${isActive
    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`;

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
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-all px-3 py-1.5 rounded-lg">
        {trigger} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 z-50" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const close = () => setMobileOpen(false);
  const handleLogout = () => { logout(); close(); navigate('/'); };

  const avatar = user?.avatar
    ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-700" />
    : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-gray-700">{user?.name?.[0]?.toUpperCase() || '?'}</div>;

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-50">
      <nav className="container mx-auto px-4 h-14 flex items-center gap-4">

        {/* Лого */}
        <Link to="/" onClick={close} className="text-lg font-black tracking-tight text-blue-600 dark:text-blue-400 shrink-0 mr-1">
          3D Print Lab
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5 flex-1">
          {MAIN_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={linkCls}>{label}</NavLink>
          ))}
          <Dropdown trigger="Ещё">
            {MORE_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {label}
              </Link>
            ))}
          </Dropdown>
        </div>

        {/* Правая часть */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <SearchBar className="w-44" />

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-800/60 hover:bg-red-100 dark:hover:bg-red-900/40 transition">
                  <Shield className="w-3.5 h-3.5" />
                  Админ
                </NavLink>
              )}

              <Dropdown trigger={
                <span className="flex items-center gap-1.5">
                  {avatar}
                  <ChevronDown className="w-3 h-3 text-gray-400 -ml-1 hidden" />
                </span>
              }>
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 hover:text-blue-600 transition-colors">
                  <User className="w-4 h-4" /> Профиль
                </Link>
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 hover:text-blue-600 transition-colors">
                  <ShoppingBag className="w-4 h-4" /> Мои заказы
                </Link>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut className="w-4 h-4" /> Выйти
                </button>
              </Dropdown>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors px-1">
                Войти
              </NavLink>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition shadow-sm">
                Регистрация
              </Link>
            </>
          )}

          <button onClick={toggleTheme}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Тема">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile кнопки */}
        <div className="md:hidden flex items-center gap-1.5 ml-auto">
          <button onClick={toggleTheme}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(v => !v)}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile меню */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900 px-4 pb-4 space-y-1">
          <div className="pt-3 pb-2">
            <SearchBar className="w-full" onSearch={close} />
          </div>
          {[...MAIN_LINKS, ...MORE_LINKS].map(({ to, label }) => (
            <NavLink key={to} to={to} className={mobileLinkCls} onClick={close}>{label}</NavLink>
          ))}
          <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
          {isAuthenticated ? (
            <>
              {user?.role === 'ADMIN' && (
                <NavLink to="/admin" className="flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={close}>
                  <Shield className="w-4 h-4" /> Панель администратора
                </NavLink>
              )}
              <NavLink to="/profile" className={mobileLinkCls} onClick={close}>
                <span className="flex items-center gap-2"><User className="w-4 h-4" /> {user?.name || 'Профиль'}</span>
              </NavLink>
              <NavLink to="/dashboard" className={mobileLinkCls} onClick={close}>
                <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Мои заказы</span>
              </NavLink>
              <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut className="w-4 h-4" /> Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={mobileLinkCls} onClick={close}>Войти</NavLink>
              <Link to="/register" className="block py-2.5 px-3 bg-blue-600 text-white text-center text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors" onClick={close}>
                Зарегистрироваться
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
