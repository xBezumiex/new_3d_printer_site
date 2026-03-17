// Хлебные крошки для навигации
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * @param {Array} items — [{ label: 'Главная', to: '/' }, { label: 'Заказы', to: '/dashboard' }, { label: '#001' }]
 * Последний элемент без to — текущая страница
 */
export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-5 flex-wrap">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Главная</span>
      </Link>

      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
          {item.to ? (
            <Link
              to={item.to}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
