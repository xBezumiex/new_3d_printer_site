import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Edit, Trash2, ChevronLeft, ChevronRight, X, MessageCircle, Send, Heart, Flag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import * as postsApi from '../../api/posts.api';
import { createReport } from '../../api/reports.api';

const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
const getImgUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${SERVER_URL}${url}`;
};

export default function PostDetail({ post, onDelete }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedImageIdx, setSelectedImageIdx] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reporting, setReporting] = useState(false);

  const canEdit = user && (user.id === post.user.id || user.role === 'ADMIN');

  useEffect(() => { loadComments(); }, [post.id]);

  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await postsApi.getComments(post.id);
      setComments(res.data.data.comments);
    } catch {}
    finally { setCommentsLoading(false); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await postsApi.addComment(post.id, commentText.trim());
      setComments(prev => [...prev, res.data.data.comment]);
      setCommentText('');
    } catch { toast.error('Не удалось добавить комментарий'); }
    finally { setSubmittingComment(false); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Удалить комментарий?')) return;
    try {
      await postsApi.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch { toast.error('Не удалось удалить комментарий'); }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить этот пост?')) return;
    setIsDeleting(true);
    try {
      await postsApi.deletePost(post.id);
      toast.success('Пост удалён');
      if (onDelete) onDelete(); else navigate('/posts');
    } catch { toast.error('Не удалось удалить пост'); }
    finally { setIsDeleting(false); }
  };

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Войдите для оценки'); return; }
    try {
      const res = await postsApi.likePost(post.id, !liked);
      setLikes(res.data.data?.likes ?? likes);
      setLiked(v => !v);
    } catch {}
  };

  const handleReport = async () => {
    if (!isAuthenticated) { toast.error('Войдите в аккаунт'); return; }
    if (reporting) return;
    setReporting(true);
    try {
      await createReport({ targetType: 'POST', targetId: post.id, reason: 'Жалоба на контент' });
      toast.success('Жалоба отправлена');
    } catch { toast.error('Не удалось отправить жалобу'); }
    finally { setReporting(false); }
  };

  const images = post.images || [];
  const selectedImage = selectedImageIdx !== null ? getImgUrl(images[selectedImageIdx]?.url) : null;

  const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div>
      {/* ── Header ─────────────────────────────── */}
      <div className="glass" style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: 'clamp(20px,4vw,32px)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="font-display tracking-widest" style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', color: 'var(--text-primary)', lineHeight: 1.1, flex: 1 }}>
              {post.title}
            </h1>
            {canEdit && (
              <div className="flex gap-2 shrink-0">
                <button onClick={() => navigate(`/posts/${post.id}/edit`)}
                  className="flex items-center gap-1.5 font-mono text-xs px-3 py-2 transition-colors"
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  <Edit className="w-3.5 h-3.5" /> Ред.
                </button>
                <button onClick={handleDelete} disabled={isDeleting}
                  className="flex items-center gap-1.5 font-mono text-xs px-3 py-2 transition-colors"
                  style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171', cursor: 'pointer', opacity: isDeleting ? 0.5 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}>
                  <Trash2 className="w-3.5 h-3.5" /> Удалить
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Link to={`/users/${post.user.id}`}
              className="flex items-center gap-2 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              <div className="w-7 h-7 overflow-hidden flex items-center justify-center font-display text-xs shrink-0"
                style={{ background: 'linear-gradient(135deg,rgba(255,77,0,0.3),rgba(79,142,247,0.3))', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
                {post.user.avatar
                  ? <img src={getImgUrl(post.user.avatar)} alt={post.user.name} className="w-full h-full object-cover" />
                  : post.user.name?.[0]?.toUpperCase()
                }
              </div>
              <span className="font-sans text-sm font-medium">{post.user.name}</span>
            </Link>
            <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.createdAt)}
            </span>
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map(tag => (
                  <span key={tag}
                    className="font-mono text-xs px-2 py-0.5"
                    style={{ background: 'var(--accent-dim)', border: '1px solid rgba(255,77,0,0.2)', color: 'var(--accent)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Images ──────────────────────────── */}
        {images.length > 0 && (
          <div style={{ padding: 'clamp(16px,3vw,24px)', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)' }}>
            <div className={`grid gap-2 ${images.length === 1 ? '' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
              {images.map((image, idx) => (
                <div key={image.id}
                  onClick={() => setSelectedImageIdx(idx)}
                  className="aspect-square overflow-hidden cursor-pointer transition-all duration-200 hover:opacity-80"
                  style={{ border: '1px solid var(--border)' }}>
                  <img
                    src={getImgUrl(image.url)}
                    alt={`${post.title} — фото ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.parentElement.style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Description ─────────────────────── */}
        <div style={{ padding: 'clamp(20px,4vw,32px)', borderBottom: '1px solid var(--border)' }}>
          <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {post.description}
          </p>
        </div>

        {/* ── Actions ─────────────────────────── */}
        <div style={{ padding: '12px clamp(16px,4vw,32px)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={handleLike}
            className="flex items-center gap-1.5 font-mono text-xs px-3 py-2 transition-all"
            style={{
              background: liked ? 'rgba(248,113,113,0.12)' : 'var(--glass-bg)',
              border: `1px solid ${liked ? 'rgba(248,113,113,0.4)' : 'var(--border-strong)'}`,
              color: liked ? '#f87171' : 'var(--text-secondary)', cursor: 'pointer',
            }}>
            <Heart className="w-3.5 h-3.5" fill={liked ? '#f87171' : 'none'} />
            {likes}
          </button>
          <button onClick={handleReport} disabled={reporting}
            className="flex items-center gap-1.5 font-mono text-xs px-3 py-2 ml-auto transition-colors"
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: reporting ? 'not-allowed' : 'pointer', opacity: reporting ? 0.5 : 1 }}
            onMouseEnter={e => { if (!reporting) { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; } }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
            <Flag className="w-3.5 h-3.5" /> Пожаловаться
          </button>
        </div>
      </div>

      {/* ── Comments ──────────────────────────── */}
      <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ padding: 'clamp(16px,4vw,24px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageCircle className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
            Комментарии
          </span>
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>({comments.length})</span>
        </div>

        <div style={{ padding: 'clamp(16px,4vw,24px)' }}>
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
            </div>
          ) : comments.length === 0 ? (
            <p className="font-sans text-sm py-4" style={{ color: 'var(--text-muted)' }}>
              Комментариев пока нет. Будьте первым!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3 group">
                  <div className="w-8 h-8 overflow-hidden flex items-center justify-center font-display text-xs shrink-0"
                    style={{ background: 'linear-gradient(135deg,rgba(255,77,0,0.2),rgba(79,142,247,0.2))', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
                    {comment.user.avatar
                      ? <img src={getImgUrl(comment.user.avatar)} alt={comment.user.name} loading="lazy" className="w-full h-full object-cover" />
                      : comment.user.name?.[0]?.toUpperCase()
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-sans text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{comment.user.name}</span>
                      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(comment.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {user && (user.id === comment.user.id || user.role === 'ADMIN') && (
                        <button onClick={() => handleDeleteComment(comment.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: '#f87171', cursor: 'pointer', background: 'none', border: 'none', padding: 2 }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', wordBreak: 'break-word' }}>{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="flex gap-3 items-start">
              <div className="w-8 h-8 overflow-hidden flex items-center justify-center font-display text-xs shrink-0"
                style={{ background: 'linear-gradient(135deg,rgba(255,77,0,0.2),rgba(79,142,247,0.2))', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
                {user?.avatar
                  ? <img src={getImgUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                  : user?.name?.[0]?.toUpperCase()
                }
              </div>
              <div className="flex-1 flex gap-2 flex-wrap sm:flex-nowrap">
                <input
                  type="text"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Напишите комментарий..."
                  maxLength={1000}
                  className="flex-1"
                  style={{
                    minWidth: 0, padding: '9px 14px',
                    background: 'var(--glass-bg)', border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                    backdropFilter: 'blur(8px)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
                />
                <button type="submit" disabled={!commentText.trim() || submittingComment}
                  className="flex items-center gap-1.5 font-sans font-medium text-sm px-4 py-2 transition-opacity shrink-0"
                  style={{ background: 'var(--accent)', color: '#000', opacity: !commentText.trim() || submittingComment ? 0.5 : 1, cursor: !commentText.trim() ? 'not-allowed' : 'pointer', border: 'none' }}>
                  {submittingComment
                    ? <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,0,0,0.3)', borderTopColor: '#000' }} />
                    : <Send className="w-4 h-4" />
                  }
                  Отправить
                </button>
              </div>
            </form>
          ) : (
            <p className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>
              <Link to="/login" style={{ color: 'var(--accent)' }}>Войдите</Link>, чтобы оставить комментарий
            </p>
          )}
        </div>
      </div>

      {/* ── Image viewer modal ─────────────────── */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedImageIdx(null)}>
          <button onClick={() => setSelectedImageIdx(null)}
            className="absolute top-4 right-4 p-2 transition-colors"
            style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setSelectedImageIdx(i => (i - 1 + images.length) % images.length); }}
                className="absolute left-4 p-3 transition-colors"
                style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={e => { e.stopPropagation(); setSelectedImageIdx(i => (i + 1) % images.length); }}
                className="absolute right-4 p-3 transition-colors"
                style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={selectedImage}
            alt="Просмотр"
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}
          />

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs px-3 py-1.5"
              style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}>
              {selectedImageIdx + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
