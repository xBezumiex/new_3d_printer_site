// Компонент загрузки аватара
import { useState, useRef } from 'react';
import { Camera, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axios';
import * as usersApi from '../../api/users.api';
import { useAuth } from '../../context/AuthContext';

export default function AvatarUpload({ user, onUpdate }) {
  const { updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Загрузить изображение на сервер
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await axiosInstance.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const avatarUrl = uploadResponse.data.data.url;

      // Обновить профиль с новым аватаром
      const response = await usersApi.updateUserProfile(user.id, {
        avatar: avatarUrl,
      });

      const updatedUser = response.data.data.user;

      // Обновить пользователя в AuthContext если это текущий пользователь
      updateUser(updatedUser);

      toast.success('Аватар обновлен');
      onUpdate(updatedUser);
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
      toast.error('Не удалось загрузить аватар');
    } finally {
      setIsUploading(false);
      // Сбросить input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative group">
      {/* Аватар */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-white text-4xl font-bold">
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}

        {/* Overlay при наведении */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {isUploading ? (
            <Loader className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </div>
      </div>

      {/* Кнопка загрузки */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
        title="Изменить аватар"
      >
        <Camera className="w-4 h-4" />
      </button>

      {/* Скрытый input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
