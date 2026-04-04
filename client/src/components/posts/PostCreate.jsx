import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, X, Image as ImageIcon, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import * as postsApi from '../../api/posts.api';
import axiosInstance from '../../api/axios';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--bg-raised)',
  border: '1px solid var(--border-strong)',
  color: 'var(--text-primary)',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s',
};

export default function PostCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 10) {
      toast.error('Максимум 10 изображений');
      return;
    }
    setSelectedFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrls(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // 1. Создать пост
      const postResponse = await postsApi.createPost(data);
      const postId = postResponse.data.data.post.id;

      // 2. Загрузить изображения если есть
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('images', file));

        try {
          const uploadResponse = await axiosInstance.post('/upload/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const imageUrls = uploadResponse.data.data.urls;
          await postsApi.addImagesToPost(postId, imageUrls);
        } catch (uploadErr) {
          // Пост создан, но фото не загрузились — переходим с предупреждением
          const msg = uploadErr.response?.data?.message || uploadErr.message || 'Ошибка загрузки фото';
          toast.error(`Пост создан, но фото не загрузились: ${msg}`, { duration: 5000 });
          navigate(`/posts/${postId}`);
          return;
        }
      }

      toast.success('Пост успешно создан!');
      navigate(`/posts/${postId}`);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Не удалось создать пост';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Заголовок */}
      <div>
        <label className="block font-mono text-xs tracking-wider uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
          Заголовок *
        </label>
        <input
          type="text"
          {...register('title', {
            required: 'Заголовок обязателен',
            minLength: { value: 3, message: 'Минимум 3 символа' },
            maxLength: { value: 200, message: 'Максимум 200 символов' },
          })}
          style={inputStyle}
          placeholder="Название вашего проекта"
          disabled={isSubmitting}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = errors.title ? '#f87171' : 'var(--border-strong)'}
        />
        {errors.title && (
          <p className="mt-1.5 font-sans text-xs" style={{ color: '#f87171' }}>{errors.title.message}</p>
        )}
      </div>

      {/* Описание */}
      <div>
        <label className="block font-mono text-xs tracking-wider uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
          Описание *
        </label>
        <textarea
          {...register('description', {
            required: 'Описание обязательно',
            minLength: { value: 10, message: 'Минимум 10 символов' },
            maxLength: { value: 5000, message: 'Максимум 5000 символов' },
          })}
          rows={8}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 160 }}
          placeholder="Расскажите о вашем проекте: материалы, процесс, результат..."
          disabled={isSubmitting}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = errors.description ? '#f87171' : 'var(--border-strong)'}
        />
        {errors.description && (
          <p className="mt-1.5 font-sans text-xs" style={{ color: '#f87171' }}>{errors.description.message}</p>
        )}
      </div>

      {/* Теги */}
      <div>
        <label className="block font-mono text-xs tracking-wider uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
          Теги <span style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans', textTransform: 'none', letterSpacing: 0 }}>(через запятую)</span>
        </label>
        <input
          type="text"
          {...register('tags')}
          style={inputStyle}
          placeholder="fdm, pla, prototyping"
          disabled={isSubmitting}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
        />
      </div>

      {/* Изображения */}
      <div>
        <label className="block font-mono text-xs tracking-wider uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
          Изображения <span style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans', textTransform: 'none', letterSpacing: 0 }}>(макс. 10)</span>
        </label>

        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 18px', background: 'var(--bg-raised)',
          border: '1px solid var(--border-strong)', cursor: 'pointer',
          color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
          opacity: isSubmitting || selectedFiles.length >= 10 ? 0.5 : 1,
          transition: 'border-color 0.2s, color 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
          <Upload className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          Выбрать изображения
          <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden"
            disabled={isSubmitting || selectedFiles.length >= 10} />
        </label>

        {previewUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group" style={{ aspectRatio: '1' }}>
                <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" style={{ border: '1px solid var(--border)' }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <button type="button" onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 flex items-center justify-center w-6 h-6 transition-colors"
                    style={{ background: 'rgba(248,113,113,0.9)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 0 }}
                    disabled={isSubmitting}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedFiles.length === 0 && (
          <div className="mt-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <span className="font-sans text-sm" style={{ color: 'var(--text-muted)' }}>Фото не выбраны — пост будет без изображений</span>
          </div>
        )}
      </div>

      {/* Кнопки */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting}
          className="flex items-center gap-2 font-sans font-semibold text-sm px-8 py-3 transition-opacity"
          style={{ background: 'var(--accent)', color: '#000', border: 'none', cursor: isSubmitting ? 'wait' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting
            ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block" /> Публикация...</>
            : <><Send className="w-4 h-4" /> Опубликовать</>}
        </button>
        <button type="button" onClick={() => navigate('/posts')} disabled={isSubmitting}
          className="font-sans font-medium text-sm px-6 py-3 transition-all"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}>
          Отмена
        </button>
      </div>
    </form>
  );
}
