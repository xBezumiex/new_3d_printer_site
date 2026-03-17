// Страница детального просмотра поста
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PostDetail from '../components/posts/PostDetail';
import * as postsApi from '../api/posts.api';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    setIsLoading(true);
    try {
      const response = await postsApi.getPostById(id);
      setPost(response.data.data.post);
    } catch (error) {
      console.error('Ошибка загрузки поста:', error);
      toast.error('Не удалось загрузить пост');
      navigate('/posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    navigate('/posts');
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

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <Breadcrumb items={[
          { label: 'Галерея', to: '/posts' },
          { label: post.title || 'Публикация' },
        ]} />

        {/* Детали поста */}
        <div className="max-w-5xl mx-auto">
          <PostDetail post={post} onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
}
