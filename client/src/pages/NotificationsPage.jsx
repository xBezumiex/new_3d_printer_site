import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, UserPlus, Heart, MessageSquare, Package, Trophy } from 'lucide-react';
import * as notificationsApi from '../api/notifications.api.js';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  NEW_FOLLOWER:       { icon: UserPlus,      color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  POST_LIKED:         { icon: Heart,         color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
  POST_COMMENTED:     { icon: MessageSquare, color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
  ORDER_STATUS_CHANGED:{ icon: Package,      color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ACHIEVEMENT_EARNED: { icon: Trophy,        color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
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

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await notificationsApi.getNotifications();
      setNotifications(res.data?.notifications || []);
    } catch {
      toast.error('Ошибка загрузки уведомлений');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Уведомления</h1>
            {unread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{unread}</span>
            )}
          </div>
          {unread > 0 && (
            <button onClick={handleMarkAll}
              className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              <CheckCheck className="w-4 h-4" /> Прочитать все
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Bell className="w-12 h-12 text-gray-200 dark:text-gray-700" />
              <p className="text-gray-400 dark:text-gray-500">Нет уведомлений</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {notifications.map(n => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.POST_LIKED;
                const Icon = cfg.icon;
                return (
                  <li key={n.id}
                    onClick={() => handleClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group ${!n.isRead ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                      <button onClick={(e) => handleDelete(e, n.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500 transition-all">
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
