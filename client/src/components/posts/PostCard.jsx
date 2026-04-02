import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Heart, Bookmark, Flag, User, Calendar } from 'lucide-react';
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
  const [hovered, setHovered] = useState(false);

  const formatDate = (d) => new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
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
    <div style={{ position: 'relative' }}>
      <Link
        to={`/posts/${post.id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'block', textDecoration: 'none',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          overflow: 'hidden',
          transition: 'transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease, border-color 0.35s ease',
          transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
          boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.15)',
          borderColor: hovered ? 'var(--border-2)' : 'var(--border)',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: 200, background: 'linear-gradient(135deg, #1e1e2e, #161622)', overflow: 'hidden' }}>
          {firstImage ? (
            <>
              <img
                src={firstImage} alt={post.title} loading="lazy"
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'transform 0.5s ease',
                  transform: hovered ? 'scale(1.04)' : 'scale(1)',
                }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              {/* Overlay gradient */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(10,10,15,0.5) 0%, transparent 50%)',
                opacity: hovered ? 1 : 0, transition: 'opacity 0.3s ease',
              }} />
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={48} color="rgba(255,255,255,0.12)" />
            </div>
          )}
          {imageCount > 1 && (
            <div style={{
              position: 'absolute', bottom: 10, right: 10,
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
              color: '#fff', fontSize: 11, fontFamily: 'DM Mono, monospace',
              padding: '3px 8px', borderRadius: 6,
              display: 'flex', alignItems: 'center', gap: 4,
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <ImageIcon size={11} /> {imageCount}
            </div>
          )}
          {/* Orange bottom line on hover */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 2,
            background: 'linear-gradient(90deg, var(--accent), #fb923c)',
            transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.4s cubic-bezier(.22,1,.36,1)',
          }} />
        </div>

        {/* Content */}
        <div style={{ padding: '16px 18px 14px' }}>
          <h3 style={{
            fontSize: 15, fontWeight: 600, color: 'var(--text-1)',
            marginBottom: 6, lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.title}
          </h3>
          {post.description && (
            <p style={{
              fontSize: 13, color: 'var(--text-3)', marginBottom: 10, lineHeight: 1.6,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {post.description}
            </p>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{
                  fontSize: 10, fontFamily: 'DM Mono, monospace',
                  padding: '2px 8px', borderRadius: 4,
                  background: 'var(--accent-dim)', color: 'var(--accent)',
                  border: '1px solid rgba(249,115,22,0.2)',
                  letterSpacing: '0.05em',
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-3)' }}>
                <User size={11} />
                <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace' }}>{post.user?.name || 'Автор'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-3)' }}>
                <Calendar size={11} />
                <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace' }}>{formatDate(post.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.preventDefault()}>
              <button
                onClick={handleLike}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 8px', borderRadius: 6,
                  fontSize: 11, fontFamily: 'DM Mono, monospace',
                  background: liked ? 'rgba(239,68,68,0.12)' : 'transparent',
                  color: liked ? '#f87171' : 'var(--text-3)',
                  border: liked ? '1px solid rgba(239,68,68,0.25)' : '1px solid transparent',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (!liked) e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { if (!liked) e.currentTarget.style.color = 'var(--text-3)'; }}
              >
                <Heart size={12} style={{ fill: liked ? '#f87171' : 'none' }} />
                {likes}
              </button>
              <button
                onClick={handleBookmark}
                style={{
                  padding: '4px 6px', borderRadius: 6,
                  background: bookmarked ? 'rgba(245,158,11,0.12)' : 'transparent',
                  color: bookmarked ? '#fbbf24' : 'var(--text-3)',
                  border: bookmarked ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent',
                  cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex',
                }}
              >
                <Bookmark size={12} style={{ fill: bookmarked ? '#fbbf24' : 'none' }} />
              </button>
              {isAuthenticated && (
                <button
                  onClick={(e) => { e.preventDefault(); setReportOpen(true); }}
                  style={{
                    padding: '4px 6px', borderRadius: 6,
                    background: 'transparent', color: 'var(--text-3)',
                    border: '1px solid transparent',
                    cursor: 'pointer', display: 'flex',
                    opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease, color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f97316'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                >
                  <Flag size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Report modal */}
      {reportOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setReportOpen(false)}
        >
          <div
            className="glass"
            style={{ borderRadius: 16, padding: 24, maxWidth: 360, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', animation: 'fadeUp 0.25s ease both' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 14 }}>Пожаловаться на пост</h3>
            <textarea
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              placeholder="Опишите причину жалобы..."
              style={{
                width: '100%', height: 90, padding: '10px 12px',
                fontSize: 13, color: 'var(--text-1)',
                background: 'var(--surface)', border: '1px solid var(--border-2)',
                borderRadius: 10, resize: 'none', outline: 'none',
                fontFamily: 'DM Sans, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={() => setReportOpen(false)}
                style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: 'var(--surface)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, border: '1px solid var(--border)', cursor: 'pointer' }}
              >
                Отмена
              </button>
              <button
                onClick={handleReport}
                style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: 'rgba(239,68,68,0.85)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
