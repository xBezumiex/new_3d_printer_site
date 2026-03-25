import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Mail, Phone, Calendar, FileText, ShoppingBag, Users, MessageCircle, Ban, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as usersApi from '../api/users.api';
import * as blocksApi from '../api/blocks.api';
import ProfileEdit from '../components/profile/ProfileEdit';
import AvatarUpload from '../components/profile/AvatarUpload';
import PostCard from '../components/posts/PostCard';
import SubscribeButton from '../components/subscriptions/SubscribeButton';
import toast from 'react-hot-toast';

function OnlineBadge({ lastActivity }) {
  if (!lastActivity) return null;
  const diff = Date.now() - new Date(lastActivity).getTime();
  const isOnline = diff < 5 * 60 * 1000;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
      isOnline
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
      {isOnline ? 'В сети' : `Был(а) ${new Date(lastActivity).toLocaleString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}
    </span>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [blockStatus, setBlockStatus] = useState({ iBlocked: false, theyBlocked: false });
  const [blockLoading, setBlockLoading] = useState(false);

  const userId = id || currentUser?.id;
  const isOwnProfile = !id || id === currentUser?.id;

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadUserPosts();
      if (!isOwnProfile && currentUser) {
        blocksApi.checkBlock(userId)
          .then(r => setBlockStatus(r.data || {}))
          .catch(() => {});
      }
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      const response = await usersApi.getUserById(userId);
      setProfileUser(response.data?.user || response.data);
    } catch {
      toast.error('Не удалось загрузить профиль');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserPosts = async () => {
    try {
      const response = await usersApi.getUserPosts(userId, { limit: 12 });
      setPosts(response.data?.posts || response.data?.data?.posts || []);
    } catch {}
  };

  const handleBlock = async () => {
    setBlockLoading(true);
    try {
      if (blockStatus.iBlocked) {
        await blocksApi.unblockUser(userId);
        setBlockStatus(prev => ({ ...prev, iBlocked: false }));
        toast.success('Пользователь разблокирован');
      } else {
        await blocksApi.blockUser(userId);
        setBlockStatus(prev => ({ ...prev, iBlocked: true }));
        toast.success('Пользователь заблокирован');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка');
    } finally {
      setBlockLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Пользователь не найден</p>
        </div>
      </div>
    );
  }

  const theyBlockedMe = blockStatus.theyBlocked;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">

          {/* Карточка профиля */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

              {/* Аватар */}
              <div className="relative">
                {isOwnProfile ? (
                  <AvatarUpload user={profileUser} onUpdate={setProfileUser} />
                ) : (
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 shrink-0">
                    {profileUser.avatar
                      ? <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
                      : <div className="flex items-center justify-center w-full h-full text-white text-4xl font-bold">{profileUser.name?.[0]?.toUpperCase()}</div>
                    }
                  </div>
                )}
              </div>

              {/* Информация */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser.name}</h1>
                      <OnlineBadge lastActivity={profileUser.lastActivity} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {profileUser.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                    </p>
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex flex-wrap gap-2">
                    {isOwnProfile && (
                      <button onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
                        <Edit2 className="w-4 h-4" /> Редактировать
                      </button>
                    )}

                    {!isOwnProfile && currentUser && (
                      <>
                        {!theyBlockedMe && !blockStatus.iBlocked && (
                          <>
                            <SubscribeButton userId={profileUser.id} onSubscriptionChange={loadProfile} />
                            <button onClick={() => navigate(`/chat/${profileUser.id}`)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition">
                              <MessageCircle className="w-4 h-4" /> Написать
                            </button>
                          </>
                        )}

                        <button onClick={handleBlock} disabled={blockLoading}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                            blockStatus.iBlocked
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40'
                          }`}>
                          {blockStatus.iBlocked
                            ? <><CheckCircle className="w-4 h-4" /> Разблокировать</>
                            : <><Ban className="w-4 h-4" /> Заблокировать</>
                          }
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Контакты */}
                <div className="space-y-1.5 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 shrink-0" /> <span>{profileUser.email}</span>
                  </div>
                  {profileUser.phone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 shrink-0" /> <span>{profileUser.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 shrink-0" /> <span>Зарегистрирован {formatDate(profileUser.createdAt)}</span>
                  </div>
                </div>

                {profileUser.bio && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{profileUser.bio}</p>
                )}

                {/* Статистика */}
                <div className="flex flex-wrap gap-5 text-sm">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">{profileUser._count?.posts || 0}</span>
                    <span className="text-gray-500 dark:text-gray-400">постов</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">{profileUser._count?.subscribers || 0}</span>
                    <span className="text-gray-500 dark:text-gray-400">подписчиков</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">{profileUser._count?.subscriptions || 0}</span>
                    <span className="text-gray-500 dark:text-gray-400">подписок</span>
                  </div>
                  {isOwnProfile && (
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-green-500" />
                      <span className="font-semibold text-gray-900 dark:text-white">{profileUser._count?.orders || 0}</span>
                      <span className="text-gray-500 dark:text-gray-400">заказов</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Посты пользователя */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Работы</h2>
            {theyBlockedMe ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                <Ban className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Контент недоступен</p>
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => <PostCard key={post.id} post={post} />)}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {isOwnProfile ? 'У вас пока нет постов' : 'Пока нет постов'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <ProfileEdit user={profileUser} onClose={() => setShowEditModal(false)} onUpdate={setProfileUser} />
      )}
    </div>
  );
}
