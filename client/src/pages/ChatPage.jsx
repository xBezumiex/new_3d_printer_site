import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Image as ImageIcon, Trash2, MessageSquare, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import * as messagesApi from '../api/messages.api.js';
import axiosInstance from '../api/axios.js';

const POLL_INTERVAL = 4000; // 4 секунды

function OnlineDot({ lastActivity }) {
  if (!lastActivity) return null;
  const isOnline = Date.now() - new Date(lastActivity).getTime() < 5 * 60 * 1000;
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
  );
}

function Avatar({ user, size = 'md' }) {
  const cls = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return user?.avatar
    ? <img src={user.avatar} alt={user.name} className={`${cls} rounded-full object-cover`} />
    : <div className={`${cls} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold`}>
        {user?.name?.[0]?.toUpperCase() || '?'}
      </div>;
}

// Список диалогов (левая панель)
function ConversationList({ conversations, activeId, onSelect }) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Нет диалогов</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Напишите первым!</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
      {conversations.map(({ partner, lastMessage, unreadCount }) => (
        <li key={partner.id}>
          <button
            onClick={() => onSelect(partner.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left ${activeId === partner.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
          >
            <div className="relative shrink-0">
              <Avatar user={partner} />
              <span className="absolute -bottom-0.5 -right-0.5"><OnlineDot lastActivity={partner.lastActivity} /></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{partner.name}</p>
                {unreadCount > 0 && (
                  <span className="shrink-0 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">{unreadCount}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {lastMessage.imageUrl && !lastMessage.text ? '📷 Фото' : lastMessage.text || ''}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

// Окно чата (правая панель)
function ChatWindow({ partnerId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await messagesApi.getMessages(partnerId);
      setMessages(res.data?.messages || []);
      if (res.data?.messages?.[0]) {
        const p = res.data.messages.find(m => m.sender.id !== currentUser.id)?.sender
          || res.data.messages[0]?.sender;
        if (p && p.id !== currentUser.id) setPartner(p);
      }
    } catch {
      // тихо
    }
  }, [partnerId, currentUser.id]);

  useEffect(() => {
    loadMessages();
    pollingRef.current = setInterval(loadMessages, POLL_INTERVAL);
    return () => clearInterval(pollingRef.current);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Загрузить партнёра если нет сообщений
  useEffect(() => {
    if (!partner) {
      axiosInstance.get(`/users/${partnerId}`).then(r => {
        setPartner(r.data?.data?.user || r.data?.user || r.data);
      }).catch(() => {});
    }
  }, [partnerId, partner]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await messagesApi.sendMessage(partnerId, { text: text.trim() });
      setMessages(prev => [...prev, res.data]);
      setText('');
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка отправки');
    } finally {
      setSending(false);
    }
  };

  const sendImage = async (file) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await axiosInstance.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = uploadRes.data?.data?.url || uploadRes.data?.url;
      const res = await messagesApi.sendMessage(partnerId, { imageUrl });
      setMessages(prev => [...prev, res.data]);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      toast.error('Ошибка загрузки изображения');
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteMsg = async (msgId) => {
    try {
      await messagesApi.deleteMessage(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Шапка чата */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {partner ? (
          <>
            <div className="relative">
              <Avatar user={partner} />
              <span className="absolute -bottom-0.5 -right-0.5"><OnlineDot lastActivity={partner.lastActivity} /></span>
            </div>
            <div>
              <Link to={`/users/${partner.id}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                {partner.name}
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {partner.lastActivity && Date.now() - new Date(partner.lastActivity).getTime() < 5 * 60 * 1000
                  ? 'В сети'
                  : partner.lastActivity
                    ? `Был(а) ${new Date(partner.lastActivity).toLocaleString('ru', { hour: '2-digit', minute: '2-digit' })}`
                    : 'Не в сети'
                }
              </p>
            </div>
          </>
        ) : (
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
        )}
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Начните диалог!</p>
          </div>
        )}
        {messages.map(msg => {
          const mine = msg.sender.id === currentUser.id;
          return (
            <div key={msg.id} className={`flex items-end gap-2 group ${mine ? 'flex-row-reverse' : ''}`}>
              {!mine && <Avatar user={msg.sender} size="sm" />}
              <div className={`max-w-[70%] ${mine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm ${mine
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm shadow-sm'}`}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="фото" className="rounded-lg max-w-xs max-h-64 object-cover mb-1 cursor-pointer"
                      onClick={() => window.open(msg.imageUrl, '_blank')} />
                  )}
                  {msg.text && <p className="break-words">{msg.text}</p>}
                </div>
                <div className={`flex items-center gap-1.5 ${mine ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(msg.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {mine && (
                    <span className="text-xs text-gray-400">{msg.isRead ? '✓✓' : '✓'}</span>
                  )}
                  {mine && (
                    <button onClick={() => deleteMsg(msg.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Поле ввода */}
      <form onSubmit={send} className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <input type="file" accept="image/*" ref={fileInputRef} className="hidden"
          onChange={e => e.target.files[0] && sendImage(e.target.files[0])} />
        <button type="button" onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors shrink-0 disabled:opacity-50">
          {uploadingImage
            ? <span className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block" />
            : <ImageIcon className="w-5 h-5" />
          }
        </button>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Написать сообщение..."
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" disabled={!text.trim() || sending}
          className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-xl transition-colors shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(userId || null);

  useEffect(() => {
    messagesApi.getConversations().then(r => {
      setConversations(r.data || []);
    }).catch(() => {});
  }, [activeId]);

  const handleSelect = (id) => {
    setActiveId(id);
    navigate(`/chat/${id}`, { replace: true });
  };

  // Если открыт конкретный диалог и его нет в списке — добавить позиционно
  const showChat = activeId;

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex h-[calc(100vh-10rem)] border border-gray-200 dark:border-gray-700">

        {/* Левая панель — список диалогов */}
        <div className={`w-80 shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col ${showChat ? 'hidden md:flex' : 'flex w-full'}`}>
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Сообщения</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationList conversations={conversations} activeId={activeId} onSelect={handleSelect} />
          </div>
        </div>

        {/* Правая панель — чат */}
        {showChat ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Мобильная кнопка назад */}
            <button onClick={() => { setActiveId(null); navigate('/chat'); }}
              className="md:hidden flex items-center gap-1.5 px-4 py-2 text-sm text-blue-600 border-b border-gray-200 dark:border-gray-700">
              <ArrowLeft className="w-4 h-4" /> Назад
            </button>
            <ChatWindow key={activeId} partnerId={activeId} currentUser={user} />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-gray-500">Выберите диалог</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
