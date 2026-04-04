import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PostCard from './PostCard';
import * as postsApi from '../../api/posts.api';
import toast from 'react-hot-toast';

function PostSkeleton() {
  return (
    <div className="glass overflow-hidden animate-pulse" style={{ borderRadius: 4 }}>
      <div style={{ height: 200, background: 'var(--bg-raised)' }} />
      <div style={{ padding: '16px 18px 14px' }}>
        <div style={{ height: 18, background: 'var(--bg-raised)', borderRadius: 3, width: '75%', marginBottom: 10 }} />
        <div style={{ height: 13, background: 'var(--bg-raised)', borderRadius: 3, width: '100%', marginBottom: 6 }} />
        <div style={{ height: 13, background: 'var(--bg-raised)', borderRadius: 3, width: '60%', marginBottom: 16 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ height: 11, background: 'var(--bg-raised)', borderRadius: 3, width: '30%' }} />
          <div style={{ height: 11, background: 'var(--bg-raised)', borderRadius: 3, width: '20%' }} />
        </div>
      </div>
    </div>
  );
}

export default function PostList({ userId, searchQuery, sort = 'newest', tag = '' }) {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const prevFilters = useRef({ searchQuery, userId, sort, tag });

  useEffect(() => {
    const prev = prevFilters.current;
    if (prev.searchQuery !== searchQuery || prev.userId !== userId || prev.sort !== sort || prev.tag !== tag) {
      prevFilters.current = { searchQuery, userId, sort, tag };
      setPage(1);
    }
  }, [searchQuery, userId, sort, tag]);

  useEffect(() => {
    loadPosts(page, searchQuery, userId, sort, tag);
  }, [page, searchQuery, userId, sort, tag]);

  const loadPosts = async (currentPage, currentSearch, currentUserId, currentSort, currentTag) => {
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit: 9 };
      if (currentUserId) params.userId = currentUserId;
      if (currentSearch) params.search = currentSearch;
      if (currentTag) params.tag = currentTag;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="glass text-center py-16" style={{ borderRadius: 12 }}>
        <p className="font-display tracking-widest text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
          НИЧЕГО НЕ НАЙДЕНО
        </p>
        <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
          {searchQuery ? `Нет результатов по запросу «${searchQuery}»` : 'Постов пока нет'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button onClick={() => goToPage(page - 1)} disabled={page === 1}
            className="p-2 transition-colors"
            style={{
              background: 'var(--glass-bg)', border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)', cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.4 : 1,
            }}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[...Array(pagination.pages)].map((_, i) => {
            const p = i + 1;
            const near = p === 1 || p === pagination.pages || (p >= page - 2 && p <= page + 2);
            const dots = (p === page - 3 && p > 1) || (p === page + 3 && p < pagination.pages);
            if (dots) return <span key={p} className="px-2 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>…</span>;
            if (!near) return null;
            return (
              <button key={p} onClick={() => goToPage(p)}
                className="px-4 py-2 font-mono text-xs transition-colors"
                style={{
                  background: p === page ? 'var(--accent)' : 'var(--glass-bg)',
                  border: `1px solid ${p === page ? 'var(--accent)' : 'var(--border-strong)'}`,
                  color: p === page ? '#000' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}>
                {p}
              </button>
            );
          })}
          <button onClick={() => goToPage(page + 1)} disabled={page === pagination.pages}
            className="p-2 transition-colors"
            style={{
              background: 'var(--glass-bg)', border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)', cursor: page === pagination.pages ? 'not-allowed' : 'pointer',
              opacity: page === pagination.pages ? 0.4 : 1,
            }}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="text-center mt-4 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
        Показано {posts.length} из {pagination.total} постов
      </div>
    </div>
  );
}
