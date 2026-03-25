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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Галерея работ</h1>
          {isAuthenticated && (
            <Link to="/posts/create"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition">
              <Plus className="w-5 h-5" /> Создать пост
            </Link>
          )}
        </div>

        {/* Поиск + сортировка */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по названию или описанию..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {search && (
                <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button type="submit" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
              Найти
            </button>
          </form>
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" />
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="py-2.5 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Теги */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {tags.map(tag => (
              <button key={tag} onClick={() => handleTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                  activeTag === tag
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}>
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Активные фильтры */}
        {(searchQuery || activeTag) && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Фильтр:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                {searchQuery}
                <button onClick={clearSearch}><X className="w-3 h-3" /></button>
              </span>
            )}
            {activeTag && (
              <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                #{activeTag}
                <button onClick={() => setActiveTag('')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        <PostList searchQuery={searchQuery} sort={sort} tag={activeTag} />
      </div>
    </div>
  );
}
