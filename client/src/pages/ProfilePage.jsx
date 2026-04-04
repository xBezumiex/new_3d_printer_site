import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Mail, Phone, Calendar, FileText, ShoppingBag, Users, MessageCircle, Ban, CheckCircle, Bookmark, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as usersApi from '../api/users.api';
import * as blocksApi from '../api/blocks.api';
import axiosInstance from '../api/axios.js';
import { getUserAchievements } from '../api/achievements.api.js';
import ProfileEdit from '../components/profile/ProfileEdit';
import AvatarUpload from '../components/profile/AvatarUpload';
import PostCard from '../components/posts/PostCard';
import SubscribeButton from '../components/subscriptions/SubscribeButton';
import toast from 'react-hot-toast';

const ACHIEVEMENT_META = {
  FIRST_POST:         { emoji: '📝', label: 'Первый пост',     desc: 'Опубликовал первый пост' },
  TEN_POSTS:          { emoji: '📚', label: '10 постов',        desc: 'Опубликовал 10 постов' },
  FIRST_FOLLOWER_TEN: { emoji: '👥', label: '10 подписчиков',   desc: 'Набрал 10 подписчиков' },
  FIRST_ORDER:        { emoji: '📦', label: 'Первый заказ',     desc: 'Оформил первый заказ' },
  POPULAR_POST:       { emoji: '🔥', label: 'Популярный пост',  desc: 'Пост набрал 50 лайков' },
  PROFILE_COMPLETE:   { emoji: '✅', label: 'Профиль заполнен', desc: 'Заполнил все поля профиля' },
};
const ALL_ACHIEVEMENT_TYPES = Object.keys(ACHIEVEMENT_META);

function OnlineBadge({ lastActivity }) {
  if (!lastActivity) return null;
  const diff = Date.now() - new Date(lastActivity).getTime();
  const isOnline = diff < 5 * 60 * 1000;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider px-2 py-1"
      style={{
        background: isOnline ? 'rgba(74,222,128,0.12)' : 'var(--glass-bg)',
        color: isOnline ? '#4ADE80' : 'var(--text-muted)',
        border: `1px solid ${isOnline ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
      }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: isOnline ? '#4ADE80' : 'var(--text-muted)' }} />
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
  const [activeTab, setActiveTab] = useState('posts');
  const [bookmarks, setBookmarks] = useState([]);
  const [achievements, setAchievements] = useState([]);

  const userId = id || currentUser?.id;
  const isOwnProfile = !id || id === currentUser?.id;

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadUserPosts();
      if (!isOwnProfile && currentUser) {
        blocksApi.checkBlock(userId).then(r => setBlockStatus(r.data || {})).catch(() => {});
      }
      getUserAchievements(userId).then(r => setAchievements(r.data?.achievements || [])).catch(() => {});
      if (!id || id === currentUser?.id) {
        axiosInstance.get('/bookmarks').then(r => setBookmarks(r.data?.data?.posts || [])).catch(() => {});
      }
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      const response = await usersApi.getUserById(userId);
      setProfileUser(response.data?.user || response.data);
    } catch { toast.error('Не удалось загрузить профиль'); }
    finally { setIsLoading(false); }
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
    } catch (err) { toast.error(err.response?.data?.message || 'Ошибка'); }
    finally { setBlockLoading(false); }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });

  const btnStyle = (color = 'var(--accent)', filled = true) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    background: filled ? color : 'var(--glass-bg)',
    color: filled ? (color === 'var(--accent)' ? '#000' : '#fff') : 'var(--text-secondary)',
    border: filled ? 'none' : '1px solid var(--border-strong)',
    backdropFilter: 'blur(8px)',
    transition: 'opacity 0.2s',
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  if (!profileUser) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>Пользователь не найден</p>
    </div>
  );

  const theyBlockedMe = blockStatus.theyBlocked;
  const tabs = [
    { key: 'posts',        icon: FileText,  label: 'Работы' },
    ...(isOwnProfile ? [{ key: 'bookmarks', icon: Bookmark, label: 'Закладки' }] : []),
    { key: 'achievements', icon: Trophy,    label: 'Достижения' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Profile header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              {isOwnProfile ? (
                <AvatarUpload user={profileUser} onUpdate={setProfileUser} />
              ) : (
                <div className="w-24 h-24 overflow-hidden flex items-center justify-center font-display text-4xl"
                  style={{ background: 'linear-gradient(135deg, rgba(255,77,0,0.3), rgba(79,142,247,0.3))', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}>
                  {profileUser.avatar
                    ? <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
                    : profileUser.name?.[0]?.toUpperCase()
                  }
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="font-display tracking-widest text-3xl" style={{ color: 'var(--text-primary)' }}>
                      {profileUser.name?.toUpperCase()}
                    </h1>
                    <OnlineBadge lastActivity={profileUser.lastActivity} />
                  </div>
                  <p className="font-mono text-[11px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                    {profileUser.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {isOwnProfile && (
                    <button onClick={() => setShowEditModal(true)} style={btnStyle()}>
                      <Edit2 className="w-4 h-4" /> Редактировать
                    </button>
                  )}
                  {!isOwnProfile && currentUser && (
                    <>
                      {!theyBlockedMe && !blockStatus.iBlocked && (
                        <>
                          <SubscribeButton userId={profileUser.id} onSubscriptionChange={loadProfile} />
                          <button onClick={() => navigate(`/chat/${profileUser.id}`)} style={btnStyle('#4ADE80')}>
                            <MessageCircle className="w-4 h-4" /> Написать
                          </button>
                        </>
                      )}
                      <button onClick={handleBlock} disabled={blockLoading}
                        style={{ ...btnStyle('transparent', false), color: blockStatus.iBlocked ? 'var(--text-secondary)' : '#f87171', borderColor: blockStatus.iBlocked ? 'var(--border-strong)' : 'rgba(248,113,113,0.3)' }}>
                        {blockStatus.iBlocked
                          ? <><CheckCircle className="w-4 h-4" /> Разблокировать</>
                          : <><Ban className="w-4 h-4" /> Заблокировать</>
                        }
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5 mb-4">
                {[
                  [Mail, profileUser.email],
                  profileUser.phone ? [Phone, profileUser.phone] : null,
                  [Calendar, `Зарегистрирован ${formatDate(profileUser.createdAt)}`],
                ].filter(Boolean).map(([Icon, text]) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                  </div>
                ))}
              </div>

              {profileUser.bio && (
                <p className="font-sans text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)', borderLeft: '2px solid var(--accent)', paddingLeft: 12 }}>
                  {profileUser.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                {[
                  [FileText,    profileUser._count?.posts || 0,         'постов',     '#4F8EF7'],
                  [Users,       profileUser._count?.subscribers || 0,   'подписчиков','#C084FC'],
                  [Users,       profileUser._count?.subscriptions || 0, 'подписок',   '#38BDF8'],
                  ...(isOwnProfile ? [[ShoppingBag, profileUser._count?.orders || 0, 'заказов', '#4ADE80']] : []),
                ].map(([Icon, val, label, color]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                    <span className="font-sans font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{val}</span>
                    <span className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + content */}
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Tab bar */}
        <div className="flex gap-1 mb-8 w-fit" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', padding: 4, backdropFilter: 'blur(12px)' }}>
          {tabs.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-4 py-2 font-mono text-xs tracking-wider transition-all"
              style={{
                background: activeTab === key ? 'var(--accent)' : 'transparent',
                color: activeTab === key ? '#000' : 'var(--text-secondary)',
              }}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Posts tab */}
        {activeTab === 'posts' && (
          theyBlockedMe ? (
            <div className="glass py-16 text-center">
              <Ban className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>Контент недоступен</p>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <div className="glass py-16 text-center">
              <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
                {isOwnProfile ? 'У вас пока нет постов' : 'Пока нет постов'}
              </p>
            </div>
          )
        )}

        {/* Bookmarks tab */}
        {activeTab === 'bookmarks' && isOwnProfile && (
          bookmarks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {bookmarks.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <div className="glass py-16 text-center">
              <Bookmark className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>Нет сохранённых постов</p>
            </div>
          )
        )}

        {/* Achievements tab */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {ALL_ACHIEVEMENT_TYPES.map(type => {
              const earned = achievements.find(a => a.type === type);
              const meta = ACHIEVEMENT_META[type];
              return (
                <div key={type} title={meta.desc}
                  className="glass glass-hover flex flex-col items-center gap-2 p-4 text-center transition-opacity"
                  style={{ opacity: earned ? 1 : 0.35 }}>
                  <span className="text-3xl" style={{ filter: earned ? 'none' : 'grayscale(1)' }}>{meta.emoji}</span>
                  <p className="font-mono text-[10px] tracking-wider leading-tight" style={{ color: 'var(--text-secondary)' }}>{meta.label}</p>
                  {earned && (
                    <p className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(earned.earnedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showEditModal && (
        <ProfileEdit user={profileUser} onClose={() => setShowEditModal(false)} onUpdate={setProfileUser} />
      )}
    </div>
  );
}
