// Список постов с пагинацией
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PostCard from './PostCard';
import * as postsApi from '../../api/posts.api';
import toast from 'react-hot-toast';

export default function PostList({ userId, searchQuery }) {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [pagination.page, userId, searchQuery]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (userId) {
        params.userId = userId;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await postsApi.getPosts(params);
      setPosts(response.data.data.posts);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Ошибка загрузки постов:', error);
      toast.error('Не удалось загрузить посты');
    } finally {
      setIsLoading(false);
    }
  };

  const goToPage = (page) => {
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {searchQuery ? 'Посты не найдены' : 'Пока нет постов'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Сетка постов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Пагинация */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          {[...Array(pagination.pages)].map((_, index) => {
            const page = index + 1;
            const isCurrentPage = page === pagination.page;

            // Показываем только первую, последнюю и текущую +/- 2 страницы
            if (
              page === 1 ||
              page === pagination.pages ||
              (page >= pagination.page - 2 && page <= pagination.page + 2)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 rounded-lg border transition ${
                    isCurrentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              );
            } else if (
              (page === pagination.page - 3 && page > 1) ||
              (page === pagination.page + 3 && page < pagination.pages)
            ) {
              return (
                <span key={page} className="px-2 text-gray-500">
                  ...
                </span>
              );
            }
            return null;
          })}

          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      )}

      {/* Информация о пагинации */}
      <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
        Показано {posts.length} из {pagination.total} постов
      </div>
    </div>
  );
}
