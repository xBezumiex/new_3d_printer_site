// Страница 404 с развёрнутой навигацией
import { Link } from 'react-router-dom';
import { Home, Upload, Calculator, BookOpen, Image, HelpCircle, Mail } from 'lucide-react';

const LINKS = [
  { to: '/',           icon: Home,       label: 'Главная' },
  { to: '/upload',     icon: Upload,     label: 'Загрузить модель' },
  { to: '/calculator', icon: Calculator, label: 'Калькулятор' },
  { to: '/posts',      icon: Image,      label: 'Галерея работ' },
  { to: '/courses',    icon: BookOpen,   label: 'Курсы' },
  { to: '/faq',        icon: HelpCircle, label: 'FAQ' },
  { to: '/contact',    icon: Mail,       label: 'Контакты' },
];

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-lg w-full">
        {/* Большая цифра 404 */}
        <div className="relative mb-8">
          <h1 className="text-[10rem] font-black text-gray-100 dark:text-gray-800 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-blue-600 text-white rounded-2xl px-6 py-3 shadow-xl">
              <p className="text-lg font-bold">Страница не найдена</p>
            </div>
          </div>
        </div>

        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Запрашиваемая страница не существует или была перемещена.<br />
          Воспользуйтесь навигацией ниже.
        </p>

        {/* Быстрые ссылки */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {LINKS.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <Icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-center">
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Кнопка на главную */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md"
        >
          <Home className="w-4 h-4" />
          На главную
        </Link>
      </div>
    </div>
  );
}
