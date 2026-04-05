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
    if (query) performSearch();
  }, [query, activeTab]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const response = await searchApi.search(query, activeTab, 20);
      setResults(response.data.data || { posts: [], users: [], total: 0 });
    } catch (err) { if (err?.status !== 0) toast.error('Не удалось выполнить поиск'); }
    finally { setIsLoading(false); }
  };

  const UserCard = ({ user }) => (
    <Link to={`/users/${user.id}`}
      className="glass glass-hover flex items-center gap-4 p-4 transition-all">
      <div className="w-14 h-14 flex items-center justify-center shrink-0 font-display text-2xl"
        style={{ background: 'linear-gradient(135deg, rgba(255,77,0,0.2), rgba(79,142,247,0.2))', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
        {user.avatar
          ? <img src={user.avatar} alt={user.name} loading="lazy" className="w-full h-full object-cover" />
          : user.name?.[0]?.toUpperCase() || '?'
        }
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-sans font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</h3>
        <p className="font-mono text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
        {user.bio && <p className="font-sans text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{user.bio}</p>}
        <div className="flex gap-3 mt-1.5">
          <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{user._count?.posts || 0} постов</span>
          {user._count?.subscribers !== undefined && (
            <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{user._count.subscribers} подписчиков</span>
          )}
        </div>
      </div>
    </Link>
  );

  if (!query) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <Search className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
        <p className="font-display tracking-widest text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>ПОИСК</p>
        <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>Введите запрос для поиска постов и пользователей</p>
      </div>
    </div>
  );

  const tabs = [
    { key: 'all',   label: 'Все' },
    { key: 'posts', label: 'Посты' },
    { key: 'users', label: 'Пользователи' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '48px 0 32px' }}>
        <div className="container mx-auto px-6">
          <p className="font-mono text-xs tracking-widest2 uppercase mb-3" style={{ color: 'var(--accent)' }}>/ поиск</p>
          <h1 className="font-display tracking-widest mb-1" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            "{query}"
          </h1>
          <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            Найдено: {results.total}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 w-fit" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', padding: 4, backdropFilter: 'blur(12px)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-4 py-2 font-mono text-xs tracking-wider transition-all"
              style={{ background: activeTab === t.key ? 'var(--accent)' : 'transparent', color: activeTab === t.key ? '#000' : 'var(--text-secondary)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
          </div>
        ) : (
          <div className="space-y-10">
            {(activeTab === 'all' || activeTab === 'posts') && results.posts?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <FileText className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  <p className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                    Посты ({results.posts.length})
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.posts.map(post => <PostCard key={post.id} post={post} />)}
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'users') && results.users?.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <User className="w-4 h-4" style={{ color: '#C084FC' }} />
                  <p className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                    Пользователи ({results.users.length})
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {results.users.map(user => <UserCard key={user.id} user={user} />)}
                </div>
              </div>
            )}

            {results.total === 0 && (
              <div className="glass py-20 text-center">
                <Search className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p className="font-display tracking-widest text-xl mb-2" style={{ color: 'var(--text-primary)' }}>НИЧЕГО НЕ НАЙДЕНО</p>
                <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>Попробуйте изменить поисковый запрос</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
