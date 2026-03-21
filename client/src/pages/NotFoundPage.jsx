// Страница 404
import { Link, useNavigate } from 'react-router-dom';
import { Home, Upload, Calculator, BookOpen, Image, HelpCircle, Mail, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

const LINKS = [
  { to: '/',           icon: Home,       label: 'Главная',         color: 'blue' },
  { to: '/upload',     icon: Upload,     label: 'Загрузить модель', color: 'purple' },
  { to: '/calculator', icon: Calculator, label: 'Калькулятор',     color: 'green' },
  { to: '/posts',      icon: Image,      label: 'Галерея работ',   color: 'pink' },
  { to: '/courses',    icon: BookOpen,   label: 'Курсы',           color: 'yellow' },
  { to: '/faq',        icon: HelpCircle, label: 'FAQ',             color: 'orange' },
  { to: '/contact',    icon: Mail,       label: 'Контакты',        color: 'teal' },
];

const COLOR_MAP = {
  blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:border-blue-400',
  purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:border-purple-400',
  green:  'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:border-green-400',
  pink:   'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800 hover:border-pink-400',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 hover:border-yellow-400',
  orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:border-orange-400',
  teal:   'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800 hover:border-teal-400',
};

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="text-center max-w-2xl w-full">

        {/* Анимированная цифра */}
        <div className="relative mb-6 select-none">
          <div className="text-[9rem] sm:text-[12rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-600 opacity-20 dark:opacity-10">
            404
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="text-6xl">🖨️</div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-3 shadow-lg">
              <p className="text-xl font-bold text-gray-900 dark:text-white">Страница не найдена</p>
            </div>
          </div>
        </div>

        <p className="text-gray-500 dark:text-gray-400 mb-2">
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
          Автоматический переход на главную через <span className="text-blue-500 font-semibold">{count}</span> сек.
        </p>

        {/* Быстрые ссылки */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {LINKS.map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${COLOR_MAP[color]}`}>
              <Icon className="w-6 h-6" />
              <span className="text-xs font-semibold text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium">
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>
          <Link to="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md">
            <Home className="w-4 h-4" /> На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
