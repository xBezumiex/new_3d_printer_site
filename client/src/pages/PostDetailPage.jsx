import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostDetail from '../components/posts/PostDetail';
import * as postsApi from '../api/posts.api';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadPost(); }, [id]);

  const loadPost = async () => {
    setIsLoading(true);
    try {
      const response = await postsApi.getPostById(id);
      setPost(response.data.data.post);
    } catch {
      toast.error('Не удалось загрузить пост');
      navigate('/posts');
    } finally { setIsLoading(false); }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  if (!post) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 60 }}>
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
        <div className="container mx-auto px-6 max-w-5xl">
          <Breadcrumb items={[
            { label: 'Галерея', to: '/posts' },
            { label: post.title || 'Публикация' },
          ]} />
        </div>
      </div>
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <PostDetail post={post} onDelete={() => navigate('/posts')} />
      </div>
    </div>
  );
}
