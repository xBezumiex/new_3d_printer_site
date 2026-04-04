import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, UserPlus, Heart, MessageSquare, Package, Trophy } from 'lucide-react';
import * as notificationsApi from '../api/notifications.api.js';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  NEW_FOLLOWER:        { icon: UserPlus,      color: '#4F8EF7' },
  POST_LIKED:          { icon: Heart,         color: '#f87171' },
  POST_COMMENTED:      { icon: MessageSquare, color: '#4ADE80' },
  ORDER_STATUS_CHANGED:{ icon: Package,       color: '#C084FC' },
  ACHIEVEMENT_EARNED:  { icon: Trophy,        color: '#FACC15' },
};

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await notificationsApi.getNotifications();
      setNotifications(res.data?.notifications || []);
    } catch { toast.error('Ошибка загрузки уведомлений'); }
    finally { setLoading(false); }
  };

  const handleClick = async (n) => {
    if (!n.isRead) {
      await notificationsApi.markOneRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    }
    if (n.link) navigate(n.link);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await notificationsApi.deleteNotification(id).catch(() => {});
    setNotifications(prev => prev.filter(x => x.id !== id));
  };

  const handleMarkAll = async () => {
    await notificationsApi.markAllRead().catch(() => {});
    setNotifications(prev => prev.map(x => ({ ...x, isRead: true })));
    toast.success('Все прочитаны');
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '48px 0 32px' }}>
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-xs tracking-widest2 uppercase mb-3" style={{ color: 'var(--accent)' }}>/ уведомления</p>
              <div className="flex items-center gap-3">
                <h1 className="font-display tracking-widest" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
                  УВЕДОМЛЕНИЯ
                </h1>
                {unread > 0 && (
                  <span className="font-mono text-xs px-2 py-1"
                    style={{ background: 'var(--accent)', color: '#000' }}>
                    {unread}
                  </span>
                )}
              </div>
            </div>
            {unread > 0 && (
              <button onClick={handleMarkAll}
                className="flex items-center gap-2 font-mono text-xs tracking-wider transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                <CheckCheck className="w-4 h-4" /> Прочитать все
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <div className="glass overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Bell className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
              <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>Нет уведомлений</p>
            </div>
          ) : (
            <ul>
              {notifications.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.POST_LIKED;
                const Icon = cfg.icon;
                return (
                  <li key={n.id}
                    onClick={() => handleClick(n)}
                    className="flex items-start gap-3 px-5 py-4 cursor-pointer group transition-colors"
                    style={{
                      borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                      background: !n.isRead ? `${cfg.color}06` : 'transparent',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = !n.isRead ? `${cfg.color}06` : 'transparent'}>
                    <div className="w-9 h-9 flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm leading-snug"
                        style={{ color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: n.isRead ? 400 : 500 }}>
                        {n.message}
                      </p>
                      <p className="font-mono text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!n.isRead && <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />}
                      <button onClick={(e) => handleDelete(e, n.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 transition-all"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
