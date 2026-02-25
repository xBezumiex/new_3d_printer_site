// Страница создания поста
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostCreate from '../components/posts/PostCreate';

export default function CreatePostPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Кнопка назад */}
        <button
          onClick={() => navigate('/posts')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад к галерее
        </button>

        {/* Форма создания */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Создать пост
            </h1>
            <PostCreate />
          </div>
        </div>
      </div>
    </div>
  );
}
