// Страница 404 - не найдено
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">
          Страница не найдена
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          К сожалению, запрашиваемая страница не существует
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
        >
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
}
