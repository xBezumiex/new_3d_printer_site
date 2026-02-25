// Страница галереи постов
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PostList from '../components/posts/PostList';
import { useAuth } from '../context/AuthContext';

export default function PostsPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Заголовок и кнопка создания */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Галерея работ
          </h1>

          {isAuthenticated && (
            <Link
              to="/posts/create"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              <Plus className="w-5 h-5" />
              Создать пост
            </Link>
          )}
        </div>

        {/* Список постов */}
        <PostList />
      </div>
    </div>
  );
}
