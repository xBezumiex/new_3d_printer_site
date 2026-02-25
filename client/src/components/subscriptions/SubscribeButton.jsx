// Кнопка подписки/отписки
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
      checkFollowingStatus();
    }
  }, [userId, isAuthenticated, currentUser]);

  const checkFollowingStatus = async () => {
    try {
      const response = await subscriptionsApi.checkFollowing(userId);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Ошибка проверки статуса подписки:', error);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Войдите, чтобы подписаться');
      return;
    }

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

      // Уведомить родительский компонент
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
    } catch (error) {
      console.error('Ошибка подписки:', error);
      toast.error(error.response?.data?.message || 'Не удалось изменить подписку');
    } finally {
      setIsLoading(false);
    }
  };

  // Не показывать кнопку для своего профиля
  if (!isAuthenticated || currentUser?.id === userId) {
    return null;
  }

  return (
    <button
      onClick={handleToggleSubscribe}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
        isFollowing
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          {isLoading ? 'Отписка...' : 'Отписаться'}
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          {isLoading ? 'Подписка...' : 'Подписаться'}
        </>
      )}
    </button>
  );
}
