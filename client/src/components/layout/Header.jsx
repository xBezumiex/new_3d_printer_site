// Шапка сайта с активными ссылками и поиском в мобильном меню
import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from '../search/SearchBar';

const NAV_LINKS = [
  { to: '/posts',      label: 'Галерея' },
  { to: '/courses',    label: 'Курсы' },
  { to: '/materials',  label: 'Материалы' },
  { to: '/upload',     label: 'Загрузить' },
  { to: '/calculator', label: 'Калькулятор' },
  { to: '/about',      label: 'О нас' },
  { to: '/faq',        label: 'FAQ' },
  { to: '/contact',    label: 'Контакты' },
];

const desktopLinkClass = ({ isActive }) =>
  `text-sm transition-colors ${
    isActive
      ? 'text-blue-600 dark:text-blue-400 font-semibold'
      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `block py-2.5 px-3 rounded-lg text-sm transition-colors ${
    isActive
      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
  }`;

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const closeMobile = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMobile();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-black text-blue-600 dark:text-blue-400 shrink-0"
            onClick={closeMobile}
          >
            3D Print Lab
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 flex-wrap">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={desktopLinkClass}>
                {label}
              </NavLink>
            ))}

            <SearchBar className="w-44" />

            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <NavLink
                    to="/admin"
                    className="px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                  >
                    Админ
                  </NavLink>
                )}
                <NavLink to="/dashboard" className={desktopLinkClass}>
                  Мои заказы
                </NavLink>
                <NavLink to="/profile" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {user?.avatar
                    ? <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                    : <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                  }
                  {user?.name || 'Профиль'}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Выход
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={desktopLinkClass}>
                  Вход
                </NavLink>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                >
                  Регистрация
                </Link>
              </>
            )}

            {/* Переключатель темы */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Mobile кнопки */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 transition-colors"
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen
                  ? <path d="M6 18L18 6M6 6l12 12" />
                  : <path d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile меню */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-gray-100 dark:border-gray-700">
            {/* Поиск */}
            <div className="pt-3 pb-2">
              <SearchBar className="w-full" onSearch={closeMobile} />
            </div>

            {/* Основные ссылки */}
            <div className="space-y-1">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} className={mobileLinkClass} onClick={closeMobile}>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Разделитель */}
            <div className="my-2 border-t border-gray-100 dark:border-gray-700" />

            {/* Авторизация */}
            {isAuthenticated ? (
              <div className="space-y-1">
                {user?.role === 'ADMIN' && (
                  <NavLink
                    to="/admin"
                    className="block py-2.5 px-3 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    onClick={closeMobile}
                  >
                    🔧 Панель администратора
                  </NavLink>
                )}
                <NavLink to="/dashboard" className={mobileLinkClass} onClick={closeMobile}>
                  📦 Мои заказы
                </NavLink>
                <NavLink to="/profile" className={mobileLinkClass} onClick={closeMobile}>
                  👤 {user?.name || 'Профиль'}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2.5 px-3 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Выход
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <NavLink
                  to="/login"
                  className={mobileLinkClass}
                  onClick={closeMobile}
                >
                  Войти
                </NavLink>
                <Link
                  to="/register"
                  className="block py-2.5 px-3 bg-blue-600 text-white text-center text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={closeMobile}
                >
                  Зарегистрироваться
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
