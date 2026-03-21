import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, ShoppingBag, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from '../search/SearchBar';

// Главные ссылки в шапке
const MAIN_LINKS = [
  { to: '/posts',      label: 'Галерея' },
  { to: '/upload',     label: 'Загрузить' },
  { to: '/calculator', label: 'Калькулятор' },
  { to: '/materials',  label: 'Материалы' },
];

// Дополнительные ссылки в выпадающем меню
const MORE_LINKS = [
  { to: '/courses',  label: 'Курсы' },
  { to: '/about',    label: 'О нас' },
  { to: '/faq',      label: 'FAQ' },
  { to: '/contact',  label: 'Контакты' },
];

const linkCls = ({ isActive }) =>
  `text-sm transition-colors whitespace-nowrap ${isActive
    ? 'text-blue-600 dark:text-blue-400 font-semibold'
    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`;

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
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        {trigger} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50" onClick={() => setOpen(false)}>
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

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Лого */}
          <Link to="/" onClick={close} className="text-xl font-black text-blue-600 dark:text-blue-400 shrink-0">
            3D Print Lab
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5 flex-1">
            {MAIN_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkCls}>{label}</NavLink>
            ))}

            {/* Ещё */}
            <Dropdown trigger="Ещё">
              {MORE_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {label}
                </Link>
              ))}
            </Dropdown>
          </div>

          {/* Правая часть */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <SearchBar className="w-40" />

            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <NavLink to="/admin"
                    className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold hover:bg-red-200 transition">
                    <Shield className="w-3.5 h-3.5 inline mr-1" />Админ
                  </NavLink>
                )}

                {/* Пользователь — dropdown */}
                <Dropdown trigger={
                  <span className="flex items-center gap-1.5">
                    {user?.avatar
                      ? <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                      : <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase() || '?'}</div>
                    }
                    <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[80px] truncate">{user?.name || 'Профиль'}</span>
                  </span>
                }>
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <User className="w-4 h-4" /> Профиль
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <ShoppingBag className="w-4 h-4" /> Мои заказы
                  </Link>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut className="w-4 h-4" /> Выйти
                  </button>
                </Dropdown>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkCls}>Вход</NavLink>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                  Регистрация
                </Link>
              </>
            )}

            <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label="Тема">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Mobile кнопки */}
          <div className="md:hidden flex items-center gap-2 ml-auto">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 transition-colors">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setMobileOpen(v => !v)} className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile меню */}
        {mobileOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-gray-100 dark:border-gray-700 space-y-1">
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
                  <NavLink to="/admin" className="block py-2.5 px-3 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onClick={close}>
                    🔧 Панель администратора
                  </NavLink>
                )}
                <NavLink to="/profile" className={mobileLinkCls} onClick={close}>👤 {user?.name || 'Профиль'}</NavLink>
                <NavLink to="/dashboard" className={mobileLinkCls} onClick={close}>📦 Мои заказы</NavLink>
                <button onClick={handleLogout} className="w-full text-left py-2.5 px-3 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Выход
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
      </nav>
    </header>
  );
}
