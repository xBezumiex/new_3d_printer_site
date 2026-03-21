// Карточка поста для списка
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Image as ImageIcon, Heart } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
const getImgUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${SERVER_URL}${url}`;
};

export default function PostCard({ post }) {
  const { isAuthenticated } = useAuth();
  const storageKey = `liked_${post.id}`;
  const [liked, setLiked]   = useState(() => localStorage.getItem(storageKey) === '1');
  const [likes, setLikes]   = useState(post.likes || 0);
  const [busy, setBusy]     = useState(false);

  const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  const firstImage = getImgUrl(post.images?.[0]?.url);
  const imageCount = post._count?.images || post.images?.length || 0;

  const handleLike = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || busy) return;
    setBusy(true);
    const next = !liked;
    setLiked(next);
    setLikes(v => v + (next ? 1 : -1));
    localStorage.setItem(storageKey, next ? '1' : '0');
    try {
      await axiosInstance.patch(`/posts/${post.id}/like`, { increment: next });
    } catch (_) {
      // откат при ошибке
      setLiked(!next);
      setLikes(v => v + (next ? -1 : 1));
      localStorage.setItem(storageKey, next ? '0' : '1');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link
      to={`/posts/${post.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
    >
      {/* Изображение */}
      {firstImage ? (
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
          <img src={firstImage} alt={post.title} loading="lazy" className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          {imageCount > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
              <ImageIcon className="w-4 h-4" /> <span>{imageCount}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <ImageIcon className="w-16 h-16 text-white/30" />
        </div>
      )}

      {/* Контент */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{post.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm">
          {post.description || ''}
        </p>

        {/* Метаданные + лайк */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{post.user?.name || 'Автор'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>

          {/* Кнопка лайка */}
          <button
            onClick={handleLike}
            title={isAuthenticated ? (liked ? 'Убрать лайк' : 'Нравится') : 'Войдите чтобы поставить лайк'}
            className={`flex items-center gap-1 px-2 py-1 rounded-full transition ${
              liked
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            } ${!isAuthenticated ? 'cursor-default' : ''}`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">{likes}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
