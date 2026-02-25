// Шапка сайта с навигацией
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from '../search/SearchBar';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-blue-600 dark:text-blue-400"
            onClick={() => setMobileMenuOpen(false)}
          >
            3D Print Lab
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/posts" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm">Галерея</Link>
            <Link to="/courses" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm">Курсы</Link>
            <Link to="/materials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm">Материалы</Link>
            <Link to="/upload" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm">Загрузить</Link>
            <Link to="/calculator" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm">Калькулятор</Link>
            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm">О нас</Link>
            <Link to="/faq" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm">FAQ</Link>
            <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm">Контакты</Link>

            {/* Search Bar */}
            <SearchBar className="w-48" />

            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                    Админ
                  </Link>
                )}
                <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm">Мои заказы</Link>
                <Link to="/profile" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm">
                  {user?.name || 'Профиль'}
                </Link>
                <button onClick={handleLogout} className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition text-sm">
                  Выход
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm">Вход</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm">Регистрация</Link>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300 p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            {[
              { to: '/posts', label: 'Галерея' },
              { to: '/courses', label: 'Курсы' },
              { to: '/materials', label: 'Материалы' },
              { to: '/upload', label: 'Загрузить' },
              { to: '/calculator', label: 'Калькулятор' },
              { to: '/about', label: 'О нас' },
              { to: '/faq', label: 'FAQ' },
              { to: '/contact', label: 'Контакты' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setMobileMenuOpen(false)}>
                {label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="block py-2 text-red-600 dark:text-red-400 font-semibold"
                    onClick={() => setMobileMenuOpen(false)}>Панель администратора</Link>
                )}
                <Link to="/dashboard" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setMobileMenuOpen(false)}>Мои заказы</Link>
                <Link to="/profile" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setMobileMenuOpen(false)}>{user?.name || 'Профиль'}</Link>
                <button onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400">
                  Выход
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setMobileMenuOpen(false)}>Вход</Link>
                <Link to="/register" className="block py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}>Регистрация</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
