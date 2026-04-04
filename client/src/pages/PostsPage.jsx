import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, X, SortAsc } from 'lucide-react';
import PostList from '../components/posts/PostList';
import { useAuth } from '../context/AuthContext';
import { getTags } from '../api/posts.api.js';

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Сначала новые' },
  { value: 'popular', label: 'Популярные' },
  { value: 'oldest',  label: 'Сначала старые' },
];

export default function PostsPage() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [activeTag, setActiveTag] = useState('');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    getTags().then(r => setTags(r.data?.data?.tags || [])).catch(() => {});
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setSearchQuery(search.trim());
    setActiveTag('');
  }, [search]);

  const clearSearch = () => { setSearch(''); setSearchQuery(''); };

  const handleTag = (tag) => {
    setActiveTag(prev => prev === tag ? '' : tag);
    setSearch(''); setSearchQuery('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', padding: '48px 0 32px' }}>
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs tracking-widest2 uppercase mb-3" style={{ color: 'var(--accent)' }}>
                / галерея
              </p>
              <h1 className="font-display tracking-widest" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
                РАБОТЫ
              </h1>
              <p className="font-sans text-sm mt-3" style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>
                Готовые изделия нашей студии и работы сообщества
              </p>
            </div>
            {isAuthenticated && (
              <Link to="/posts/create"
                className="btn-primary flex items-center gap-2 px-6 py-3 font-sans font-semibold text-sm shrink-0"
                style={{ background: 'var(--accent)', color: '#000' }}>
                <Plus className="w-4 h-4" />
                Создать пост
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-8">
        {/* Search + sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по названию или описанию..."
                className="w-full"
                style={{
                  paddingLeft: 36, paddingRight: search ? 36 : 14, paddingTop: 10, paddingBottom: 10,
                  background: 'var(--glass-bg)', border: '1px solid var(--border-strong)',
                  color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                  backdropFilter: 'blur(12px)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
              />
              {search && (
                <button type="button" onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit"
              className="px-5 font-sans font-medium text-sm transition-colors"
              style={{ background: 'var(--accent)', color: '#000' }}>
              Найти
            </button>
          </form>

          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{
                padding: '10px 12px',
                background: 'var(--glass-bg)', border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                backdropFilter: 'blur(12px)',
              }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ background: 'var(--bg-raised)' }}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map(tag => (
              <button key={tag} onClick={() => handleTag(tag)}
                className="font-mono text-xs transition-all duration-200"
                style={{
                  padding: '5px 12px',
                  background: activeTag === tag ? 'var(--accent)' : 'var(--glass-bg)',
                  color: activeTag === tag ? '#000' : 'var(--text-secondary)',
                  border: `1px solid ${activeTag === tag ? 'var(--accent)' : 'var(--border-strong)'}`,
                  backdropFilter: 'blur(8px)',
                  letterSpacing: '0.05em',
                }}>
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Active filters */}
        {(searchQuery || activeTag) && (
          <div className="flex items-center gap-2 mb-5">
            <span className="font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>Фильтр:</span>
            {searchQuery && (
              <span className="glass inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs" style={{ color: 'var(--accent)' }}>
                {searchQuery}
                <button onClick={clearSearch} className="transition-opacity hover:opacity-60"><X className="w-3 h-3" /></button>
              </span>
            )}
            {activeTag && (
              <span className="glass inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs" style={{ color: 'var(--accent)' }}>
                #{activeTag}
                <button onClick={() => setActiveTag('')} className="transition-opacity hover:opacity-60"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        <PostList searchQuery={searchQuery} sort={sort} tag={activeTag} />
      </div>
    </div>
  );
}
