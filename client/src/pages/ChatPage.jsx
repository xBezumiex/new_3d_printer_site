import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Image as ImageIcon, Trash2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import * as messagesApi from '../api/messages.api.js';
import axiosInstance from '../api/axios.js';

const POLL_INTERVAL = 4000;

function OnlineDot({ lastActivity }) {
  if (!lastActivity) return null;
  const isOnline = Date.now() - new Date(lastActivity).getTime() < 5 * 60 * 1000;
  return (
    <span className="inline-block w-2 h-2 rounded-full shrink-0"
      style={{ background: isOnline ? '#4ADE80' : 'var(--text-muted)' }} />
  );
}

function Avatar({ user, size = 'md' }) {
  const sz = size === 'sm' ? { width: 32, height: 32, fontSize: 12 } : { width: 40, height: 40, fontSize: 14 };
  return user?.avatar
    ? <img src={user.avatar} alt={user.name} style={{ ...sz, borderRadius: '50%', objectFit: 'cover' }} />
    : <div style={{
        ...sz, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(255,77,0,0.3), rgba(79,142,247,0.3))',
        border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontFamily: 'Bebas Neue, sans-serif',
      }}>
        {user?.name?.[0]?.toUpperCase() || '?'}
      </div>;
}

function ConversationList({ conversations, activeId, onSelect }) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <MessageSquare className="w-10 h-10 mb-3" style={{ color: 'var(--text-muted)' }} />
        <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>Нет диалогов</p>
        <p className="font-mono text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Напишите первым!</p>
      </div>
    );
  }

  return (
    <ul style={{ borderTop: '1px solid var(--border)' }}>
      {conversations.map(({ partner, lastMessage, unreadCount }) => (
        <li key={partner.id} style={{ borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => onSelect(partner.id)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
            style={{
              background: activeId === partner.id ? 'rgba(255,77,0,0.08)' : 'transparent',
              borderLeft: activeId === partner.id ? '2px solid var(--accent)' : '2px solid transparent',
            }}
            onMouseEnter={e => { if (activeId !== partner.id) e.currentTarget.style.background = 'var(--bg-raised)'; }}
            onMouseLeave={e => { if (activeId !== partner.id) e.currentTarget.style.background = 'transparent'; }}>
            <div className="relative shrink-0">
              <Avatar user={partner} />
              <span className="absolute -bottom-0.5 -right-0.5"><OnlineDot lastActivity={partner.lastActivity} /></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-sans font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{partner.name}</p>
                {unreadCount > 0 && (
                  <span className="shrink-0 font-mono text-[10px] px-1.5 py-0.5 min-w-[1.25rem] text-center"
                    style={{ background: 'var(--accent)', color: '#000', borderRadius: 2 }}>{unreadCount}</span>
                )}
              </div>
              <p className="font-sans text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {lastMessage.imageUrl && !lastMessage.text ? '📷 Фото' : lastMessage.text || ''}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

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
    } catch {}
  }, [partnerId, currentUser.id]);

  useEffect(() => {
    loadMessages();
    pollingRef.current = setInterval(loadMessages, POLL_INTERVAL);
    return () => clearInterval(pollingRef.current);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    } finally { setSending(false); }
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
    } catch { toast.error('Ошибка загрузки изображения'); }
    finally { setUploadingImage(false); }
  };

  const deleteMsg = async (msgId) => {
    try {
      await messagesApi.deleteMessage(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch { toast.error('Ошибка удаления'); }
  };

  const isOnline = partner?.lastActivity && Date.now() - new Date(partner.lastActivity).getTime() < 5 * 60 * 1000;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        {partner ? (
          <>
            <div className="relative">
              <Avatar user={partner} />
              <span className="absolute -bottom-0.5 -right-0.5"><OnlineDot lastActivity={partner.lastActivity} /></span>
            </div>
            <div>
              <Link to={`/users/${partner.id}`} className="font-sans font-semibold text-sm transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
                {partner.name}
              </Link>
              <p className="font-mono text-[10px]" style={{ color: isOnline ? '#4ADE80' : 'var(--text-muted)' }}>
                {isOnline ? 'В сети' : partner.lastActivity
                  ? `Был(а) ${new Date(partner.lastActivity).toLocaleString('ru', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Не в сети'}
              </p>
            </div>
          </>
        ) : (
          <div className="h-10 w-32 rounded animate-pulse" style={{ background: 'var(--bg-raised)' }} />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'var(--bg)' }}>
        {messages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>Начните диалог!</p>
          </div>
        )}
        {messages.map(msg => {
          const mine = msg.sender.id === currentUser.id;
          return (
            <div key={msg.id} className={`flex items-end gap-2 group ${mine ? 'flex-row-reverse' : ''}`}>
              {!mine && <Avatar user={msg.sender} size="sm" />}
              <div className={`max-w-[70%] flex flex-col gap-1 ${mine ? 'items-end' : 'items-start'}`}>
                <div className="px-4 py-2.5 text-sm"
                  style={{
                    background: mine ? 'var(--accent)' : 'var(--bg-surface)',
                    color: mine ? '#000' : 'var(--text-primary)',
                    border: mine ? 'none' : '1px solid var(--border)',
                    borderRadius: mine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  }}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="фото"
                      className="rounded-lg max-w-xs max-h-64 object-cover mb-1 cursor-pointer"
                      onClick={() => window.open(msg.imageUrl, '_blank')} />
                  )}
                  {msg.text && <p className="break-words font-sans">{msg.text}</p>}
                </div>
                <div className={`flex items-center gap-1.5 ${mine ? 'flex-row-reverse' : ''}`}>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {new Date(msg.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {mine && <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{msg.isRead ? '✓✓' : '✓'}</span>}
                  {mine && (
                    <button onClick={() => deleteMsg(msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex items-center gap-2 px-4 py-3"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <input type="file" accept="image/*" ref={fileInputRef} className="hidden"
          onChange={e => e.target.files[0] && sendImage(e.target.files[0])} />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
          className="shrink-0 p-2 transition-colors"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: uploadingImage ? 0.5 : 1 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          {uploadingImage
            ? <span className="w-5 h-5 border-2 rounded-full animate-spin inline-block" style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
            : <ImageIcon className="w-5 h-5" />}
        </button>
        <input type="text" value={text} onChange={e => setText(e.target.value)}
          placeholder="Написать сообщение..."
          className="flex-1 font-sans text-sm px-4 py-2 focus:outline-none"
          style={{
            background: 'var(--bg-raised)', border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)', borderRadius: 2,
          }} />
        <button type="submit" disabled={!text.trim() || sending}
          className="shrink-0 p-2.5 transition-all"
          style={{
            background: text.trim() && !sending ? 'var(--accent)' : 'var(--bg-raised)',
            border: '1px solid var(--border-strong)', cursor: text.trim() ? 'pointer' : 'default',
            color: text.trim() && !sending ? '#000' : 'var(--text-muted)',
          }}>
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

  const showChat = activeId;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 0 60px' }}>
      <div className="container mx-auto px-4 max-w-5xl" style={{ height: 'calc(100vh - 10rem)' }}>
        <div className="overflow-hidden flex h-full"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>

          {/* Left panel */}
          <div className={`w-72 shrink-0 flex flex-col ${showChat ? 'hidden md:flex' : 'flex w-full'}`}
            style={{ borderRight: '1px solid var(--border)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="font-mono text-[10px] tracking-widest uppercase mb-0.5" style={{ color: 'var(--accent)' }}>/ чат</p>
              <h2 className="font-display tracking-widest text-lg" style={{ color: 'var(--text-primary)' }}>СООБЩЕНИЯ</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationList conversations={conversations} activeId={activeId} onSelect={handleSelect} />
            </div>
          </div>

          {/* Right panel */}
          {showChat ? (
            <div className="flex-1 flex flex-col min-w-0">
              <button onClick={() => { setActiveId(null); navigate('/chat'); }}
                className="md:hidden flex items-center gap-1.5 px-4 py-2 font-mono text-xs transition-colors"
                style={{ borderBottom: '1px solid var(--border)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}>
                <ArrowLeft className="w-4 h-4" /> Назад
              </button>
              <ChatWindow key={activeId} partnerId={activeId} currentUser={user} />
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--border-strong)' }} />
                <p className="font-display tracking-widest text-xl" style={{ color: 'var(--text-muted)', WebkitTextStroke: '1px var(--border-strong)', WebkitTextFillColor: 'transparent' }}>ВЫБЕРИТЕ ДИАЛОГ</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
