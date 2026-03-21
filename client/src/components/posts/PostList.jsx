// Список постов с пагинацией и skeleton-loader
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PostCard from './PostCard';
import * as postsApi from '../../api/posts.api';
import toast from 'react-hot-toast';

function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="flex justify-between mt-4">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export default function PostList({ userId, searchQuery, sort = 'newest' }) {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const prevFilters = useRef({ searchQuery, userId, sort });

  // Сброс страницы при смене фильтров
  useEffect(() => {
    const prev = prevFilters.current;
    if (prev.searchQuery !== searchQuery || prev.userId !== userId || prev.sort !== sort) {
      prevFilters.current = { searchQuery, userId, sort };
      setPage(1);
    }
  }, [searchQuery, userId, sort]);

  useEffect(() => {
    loadPosts(page, searchQuery, userId, sort);
  }, [page, searchQuery, userId, sort]);

  const loadPosts = async (currentPage, currentSearch, currentUserId, currentSort) => {
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit: 9 };
      if (currentUserId) params.userId = currentUserId;
      if (currentSearch) params.search = currentSearch;
      if (currentSort === 'popular') params.sort = 'likes';
      if (currentSort === 'oldest') params.order = 'asc';

      const response = await postsApi.getPosts(params);
      const data = response.data?.data || response.data;
      setPosts(data.posts || []);
      setPagination({ total: data.pagination?.total || 0, pages: data.pagination?.pages || 0 });
    } catch {
      toast.error('Не удалось загрузить посты');
    } finally {
      setIsLoading(false);
    }
  };

  const goToPage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🖼️</div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {searchQuery ? `Ничего не найдено по запросу «${searchQuery}»` : 'Пока нет постов'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => goToPage(page - 1)} disabled={page === 1}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          {[...Array(pagination.pages)].map((_, i) => {
            const p = i + 1;
            const near = p === 1 || p === pagination.pages || (p >= page - 2 && p <= page + 2);
            const dots = (p === page - 3 && p > 1) || (p === page + 3 && p < pagination.pages);
            if (dots) return <span key={p} className="px-2 text-gray-500">...</span>;
            if (!near) return null;
            return (
              <button key={p} onClick={() => goToPage(p)}
                className={`px-4 py-2 rounded-lg border transition ${p === page
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                {p}
              </button>
            );
          })}
          <button onClick={() => goToPage(page + 1)} disabled={page === pagination.pages}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      )}
      <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
        Показано {posts.length} из {pagination.total} постов
      </div>
    </div>
  );
}
