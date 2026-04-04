import { useState, useEffect } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as subscriptionsApi from '../../api/subscriptions.api';
import toast from 'react-hot-toast';

export default function SubscribeButton({ userId, onSubscriptionChange }) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser?.id !== userId) {
      subscriptionsApi.checkFollowing(userId)
        .then(r => setIsFollowing(r.data.isFollowing))
        .catch(() => {});
    }
  }, [userId, isAuthenticated, currentUser]);

  if (!isAuthenticated || currentUser?.id === userId) return null;

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await subscriptionsApi.unsubscribe(userId);
        setIsFollowing(false);
        toast.success('Вы отписались');
      } else {
        await subscriptionsApi.subscribe(userId);
        setIsFollowing(true);
        toast.success('Вы подписались');
      }
      if (onSubscriptionChange) onSubscriptionChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Не удалось изменить подписку');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="flex items-center gap-2 font-sans text-sm font-medium transition-all"
      style={{
        padding: '8px 14px', cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.6 : 1,
        background: isFollowing ? 'var(--glass-bg)' : 'var(--accent)',
        color: isFollowing ? 'var(--text-secondary)' : '#000',
        border: isFollowing ? '1px solid var(--border-strong)' : 'none',
        backdropFilter: isFollowing ? 'blur(8px)' : 'none',
      }}
    >
      {isFollowing ? (
        <><UserMinus className="w-4 h-4" />{isLoading ? '...' : 'Отписаться'}</>
      ) : (
        <><UserPlus className="w-4 h-4" />{isLoading ? '...' : 'Подписаться'}</>
      )}
    </button>
  );
}
