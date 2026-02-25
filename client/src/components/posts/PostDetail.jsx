// Детальный просмотр поста
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Edit, Trash2, ChevronLeft, ChevronRight, X, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import * as postsApi from '../../api/posts.api';

const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
const getImgUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${SERVER_URL}${url}`;
};

export default function PostDetail({ post, onDelete }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const canEdit = user && (user.id === post.user.id || user.role === 'ADMIN');

  useEffect(() => {
    loadComments();
  }, [post.id]);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await postsApi.getComments(post.id);
      setComments(res.data.data.comments);
    } catch {
      // silently fail
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await postsApi.addComment(post.id, commentText.trim());
      setComments(prev => [...prev, res.data.data.comment]);
      setCommentText('');
    } catch {
      toast.error('Не удалось добавить комментарий');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Удалить комментарий?')) return;
    try {
      await postsApi.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch {
      toast.error('Не удалось удалить комментарий');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) return;

    setIsDeleting(true);
    try {
      await postsApi.deletePost(post.id);
      toast.success('Пост удален');
      if (onDelete) {
        onDelete();
      } else {
        navigate('/posts');
      }
    } catch (error) {
      console.error('Ошибка удаления поста:', error);
      toast.error('Не удалось удалить пост');
    } finally {
      setIsDeleting(false);
    }
  };

  const openImageViewer = (index) => {
    setCurrentImageIndex(index);
    setSelectedImage(getImgUrl(post.images[index].url));
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const newIndex = (currentImageIndex + 1) % post.images.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(getImgUrl(post.images[newIndex].url));
  };

  const prevImage = () => {
    const newIndex = (currentImageIndex - 1 + post.images.length) % post.images.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(getImgUrl(post.images[newIndex].url));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Заголовок и действия */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex-1">
            {post.title}
          </h1>

          {canEdit && (
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => navigate(`/posts/${post.id}/edit`)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                title="Редактировать"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
                title="Удалить"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Метаданные */}
        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-medium">{post.user.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Изображения */}
      {post.images && post.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 bg-gray-50 dark:bg-gray-900">
          {post.images.map((image, index) => (
            <div
              key={image.id}
              onClick={() => openImageViewer(index)}
              className="aspect-square cursor-pointer overflow-hidden rounded-lg hover:opacity-90 transition"
            >
              <img
                src={getImgUrl(image.url)}
                alt={`${post.title} - изображение ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Содержание */}
      <div className="p-6">
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {post.description}
          </p>
        </div>
      </div>

      {/* Комментарии */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-5">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          Комментарии
          <span className="ml-1 text-sm font-normal text-gray-400">({comments.length})</span>
        </h2>

        {/* Список комментариев */}
        {commentsLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-5">Комментариев пока нет. Будьте первым!</p>
        ) : (
          <div className="space-y-4 mb-6">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3 group">
                {/* Аватар */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                  {comment.user.avatar ? (
                    <img src={getImgUrl(comment.user.avatar)} alt={comment.user.name} className="w-full h-full object-cover" />
                  ) : (
                    comment.user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{comment.user.name}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {user && (user.id === comment.user.id || user.role === 'ADMIN') && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-600 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Форма добавления комментария */}
        {isAuthenticated ? (
          <form onSubmit={handleAddComment} className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Напишите комментарий..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submittingComment}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium"
              >
                {submittingComment ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Отправить
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <a href="/login" className="text-blue-600 hover:underline">Войдите</a>, чтобы оставить комментарий
          </p>
        )}
      </div>

      {/* Модальное окно просмотра изображений */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeImageViewer}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={closeImageViewer}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Навигация */}
          {post.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 p-2 text-white hover:bg-white/20 rounded-full transition"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 p-2 text-white hover:bg-white/20 rounded-full transition"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Изображение */}
          <img
            src={selectedImage}
            alt="Полноразмерное изображение"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Счетчик изображений */}
          {post.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {post.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
