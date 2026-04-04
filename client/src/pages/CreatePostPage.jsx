import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostCreate from '../components/posts/PostCreate';

export default function CreatePostPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '32px 0 24px' }}>
        <div className="container mx-auto px-6">
          <button onClick={() => navigate('/posts')}
            className="flex items-center gap-2 mb-4 font-mono text-xs tracking-wider transition-colors"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <ArrowLeft className="w-4 h-4" /> Назад к галерее
          </button>
          <p className="font-mono text-xs tracking-widest2 uppercase mb-3" style={{ color: 'var(--accent)' }}>/ публикация</p>
          <h1 className="font-display tracking-widest" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            СОЗДАТЬ ПОСТ
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="glass p-8">
          <PostCreate />
        </div>
      </div>
    </div>
  );
}
