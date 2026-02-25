// Страница поиска
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, User, FileText } from 'lucide-react';
import * as searchApi from '../api/search.api';
import PostCard from '../components/posts/PostCard';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({ posts: [], users: [], total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, activeTab]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const response = await searchApi.search(query, activeTab, 20);
      setResults(response.data.data || { posts: [], users: [], total: 0 });
    } catch (error) {
      console.error('Ошибка поиска:', error);
      toast.error('Не удалось выполнить поиск');
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserCard = (user) => (
    <Link
      key={user.id}
      to={`/users/${user.id}`}
      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition"
    >
      {/* Аватар */}
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-white text-xl font-bold">
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
          {user.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
        {user.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {user.bio}
          </p>
        )}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-500">
          <span>{user._count?.posts || 0} постов</span>
          {user._count?.subscribers !== undefined && (
            <span>{user._count.subscribers} подписчиков</span>
          )}
        </div>
      </div>
    </Link>
  );

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Введите запрос для поиска
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Найдите посты или пользователей по ключевым словам
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Результаты поиска: "{query}"
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Найдено результатов: {results.total}
            </p>
          </div>

          {/* Табы */}
          <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 px-4 font-semibold transition ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-3 px-4 font-semibold transition ${
                activeTab === 'posts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Посты
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-4 font-semibold transition ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Пользователи
            </button>
          </div>

          {/* Результаты */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Посты */}
              {(activeTab === 'all' || activeTab === 'posts') && results.posts?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Посты ({results.posts.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {/* Пользователи */}
              {(activeTab === 'all' || activeTab === 'users') && results.users?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Пользователи ({results.users.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.users.map((user) => renderUserCard(user))}
                  </div>
                </div>
              )}

              {/* Пустые результаты */}
              {results.total === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Ничего не найдено
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Попробуйте изменить поисковый запрос
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
