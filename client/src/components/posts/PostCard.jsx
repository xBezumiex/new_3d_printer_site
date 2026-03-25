import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Image as ImageIcon, Heart, Bookmark, Flag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toggleLike, checkLike, toggleBookmark, checkBookmark } from '../../api/posts.api.js';
import { createReport } from '../../api/reports.api.js';
import toast from 'react-hot-toast';

const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
const getImgUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${SERVER_URL}${url}`;
};

export default function PostCard({ post }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [bookmarked, setBookmarked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  const firstImage = getImgUrl(post.images?.[0]?.url);
  const imageCount = post._count?.images || post.images?.length || 0;

  useEffect(() => {
    if (!isAuthenticated) return;
    checkLike(post.id).then(r => {
      setLiked(r.data?.data?.liked ?? false);
      setLikes(r.data?.data?.count ?? post.likes ?? 0);
    }).catch(() => {});
    checkBookmark(post.id).then(r => {
      setBookmarked(r.data?.data?.bookmarked ?? false);
    }).catch(() => {});
  }, [post.id, isAuthenticated]);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (busy) return;
    setBusy(true);
    setLiked(v => !v);
    setLikes(v => v + (liked ? -1 : 1));
    try {
      const res = await toggleLike(post.id);
      setLiked(res.data?.data?.liked ?? !liked);
      setLikes(res.data?.data?.count ?? likes);
    } catch {
      setLiked(v => !v);
      setLikes(v => v + (liked ? 1 : -1));
    } finally {
      setBusy(false);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    const next = !bookmarked;
    setBookmarked(next);
    try {
      await toggleBookmark(post.id);
      toast.success(next ? 'Добавлено в закладки' : 'Удалено из закладок', { duration: 1500 });
    } catch {
      setBookmarked(!next);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    try {
      await createReport({ targetType: 'POST', targetId: post.id, reason: reportReason });
      toast.success('Жалоба отправлена');
      setReportOpen(false);
      setReportReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка');
    }
  };

  return (
    <div className="relative group">
      <Link
        to={`/posts/${post.id}`}
        className="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
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
        <div className="p-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 line-clamp-2">{post.title}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 text-sm">{post.description || ''}</p>

          {/* Теги */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span className="text-xs">{post.user?.name || 'Автор'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs">{formatDate(post.createdAt)}</span>
              </div>
            </div>

            {/* Действия */}
            <div className="flex items-center gap-1" onClick={e => e.preventDefault()}>
              <button onClick={handleLike}
                className={`flex items-center gap-1 px-2 py-1 rounded-full transition ${liked ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
                <span className="text-xs font-medium">{likes}</span>
              </button>
              <button onClick={handleBookmark}
                className={`p-1.5 rounded-full transition ${bookmarked ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}>
                <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
              {isAuthenticated && (
                <button onClick={(e) => { e.preventDefault(); setReportOpen(true); }}
                  className="p-1.5 rounded-full text-gray-300 hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition opacity-0 group-hover:opacity-100">
                  <Flag className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Модалка жалобы */}
      {reportOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReportOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Пожаловаться на пост</h3>
            <textarea
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              placeholder="Опишите причину жалобы..."
              className="w-full h-24 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setReportOpen(false)}
                className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 transition">
                Отмена
              </button>
              <button onClick={handleReport}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition">
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
