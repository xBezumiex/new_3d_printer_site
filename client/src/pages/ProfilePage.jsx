// Страница профиля пользователя
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Edit2, Mail, Phone, Calendar, FileText, ShoppingBag, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as usersApi from '../api/users.api';
import ProfileEdit from '../components/profile/ProfileEdit';
import AvatarUpload from '../components/profile/AvatarUpload';
import PostCard from '../components/posts/PostCard';
import SubscribeButton from '../components/subscriptions/SubscribeButton';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Если нет ID в URL, показываем профиль текущего пользователя
  const userId = id || currentUser?.id;
  const isOwnProfile = !id || id === currentUser?.id;

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadUserPosts();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      // Всегда загружаем с сервера для получения актуального _count (заказы, посты)
      const response = await usersApi.getUserById(userId);
      setProfileUser(response.data.data.user);
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      toast.error('Не удалось загрузить профиль');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const response = await usersApi.getUserPosts(userId, { limit: 12 });
      setPosts(response.data.data.posts || []);
    } catch (error) {
      console.error('Ошибка загрузки постов:', error);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setProfileUser(updatedUser);
  };

  const handleSubscriptionChange = () => {
    // Перезагрузить профиль для обновления счетчика подписчиков
    loadProfile();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Пользователь не найден</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Карточка профиля */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Аватар */}
              {isOwnProfile ? (
                <AvatarUpload user={profileUser} onUpdate={handleProfileUpdate} />
              ) : (
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                  {profileUser.avatar ? (
                    <img
                      src={profileUser.avatar}
                      alt={profileUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-white text-4xl font-bold">
                      {profileUser.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
              )}

              {/* Информация */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {profileUser.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {profileUser.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {isOwnProfile && (
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                      >
                        <Edit2 className="w-4 h-4" />
                        Редактировать
                      </button>
                    )}
                    {!isOwnProfile && (
                      <SubscribeButton
                        userId={profileUser.id}
                        onSubscriptionChange={handleSubscriptionChange}
                      />
                    )}
                  </div>
                </div>

                {/* Контакты */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{profileUser.email}</span>
                  </div>
                  {profileUser.phone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{profileUser.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Зарегистрирован {formatDate(profileUser.createdAt)}</span>
                  </div>
                </div>

                {/* Биография */}
                {profileUser.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {profileUser.bio}
                  </p>
                )}

                {/* Статистика */}
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {profileUser._count?.posts || 0}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">постов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {profileUser._count?.subscribers || 0}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">подписчиков</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {profileUser._count?.subscriptions || 0}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">подписок</span>
                  </div>
                  {isOwnProfile && (
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {profileUser._count?.orders || 0}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">заказов</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Посты пользователя */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Работы пользователя
            </h2>

            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {isOwnProfile
                    ? 'У вас пока нет постов'
                    : 'У пользователя пока нет постов'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно редактирования */}
      {showEditModal && (
        <ProfileEdit
          user={profileUser}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}
