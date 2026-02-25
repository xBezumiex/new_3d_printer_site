// Форма создания поста
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import * as postsApi from '../../api/posts.api';
import axiosInstance from '../../api/axios';

export default function PostCreate() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 10) {
      toast.error('Максимум 10 изображений');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);

    // Создание превью
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // 1. Создать пост
      const postResponse = await postsApi.createPost(data);
      const postId = postResponse.data.data.post.id;

      // 2. Загрузить изображения на сервер (если есть)
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('images', file));

        const uploadResponse = await axiosInstance.post('/upload/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const imageUrls = uploadResponse.data.data.urls;

        // 3. Добавить изображения к посту
        await postsApi.addImagesToPost(postId, imageUrls);
      }

      toast.success('Пост успешно создан!');
      navigate(`/posts/${postId}`);
    } catch (error) {
      console.error('Ошибка создания поста:', error);
      toast.error(error.message || 'Не удалось создать пост');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Заголовок */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Заголовок *
        </label>
        <input
          type="text"
          {...register('title', {
            required: 'Заголовок обязателен',
            minLength: {
              value: 3,
              message: 'Минимум 3 символа',
            },
            maxLength: {
              value: 200,
              message: 'Максимум 200 символов',
            },
          })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Название вашего проекта"
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
        )}
      </div>

      {/* Содержание */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Описание *
        </label>
        <textarea
          {...register('description', {
            required: 'Описание обязательно',
            minLength: {
              value: 10,
              message: 'Минимум 10 символов',
            },
            maxLength: {
              value: 5000,
              message: 'Максимум 5000 символов',
            },
          })}
          rows={10}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Расскажите о вашем проекте: что вы печатали, какие материалы использовали, какие были трудности..."
          disabled={isSubmitting}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
        )}
      </div>

      {/* Изображения */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Изображения (максимум 10)
        </label>

        {/* Кнопка загрузки */}
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition">
          <Upload className="w-5 h-5" />
          <span>Загрузить изображения</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={isSubmitting || selectedFiles.length >= 10}
          />
        </label>

        {/* Превью изображений */}
        {previewUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Кнопки */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          {isSubmitting ? 'Создание...' : 'Опубликовать пост'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/posts')}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
