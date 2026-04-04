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

    if (!file.type.startsWith('image/')) { toast.error('Выберите изображение'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Максимальный размер 5 MB'); return; }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const uploadRes = await axiosInstance.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const avatarUrl = uploadRes.data.data.url;
      const response = await usersApi.updateUserProfile(user.id, { avatar: avatarUrl });
      const updatedUser = response.data?.user || response.data?.data?.user;

      updateUser(updatedUser);
      toast.success('Аватар обновлён');
      onUpdate(updatedUser);
    } catch (error) {
      console.error(error);
      toast.error('Не удалось загрузить аватар');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative group" style={{ width: 96, height: 96 }}>
      {/* Avatar */}
      <div className="w-24 h-24 overflow-hidden flex items-center justify-center font-display text-4xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,77,0,0.3), rgba(79,142,247,0.3))',
          border: '1px solid var(--border-strong)',
          color: 'var(--text-primary)',
        }}>
        {user.avatar
          ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          : user.name?.[0]?.toUpperCase() || '?'
        }

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.55)', cursor: 'pointer' }}
          onClick={() => !isUploading && fileInputRef.current?.click()}>
          {isUploading
            ? <Loader className="w-7 h-7 animate-spin" style={{ color: 'var(--accent)' }} />
            : <Camera className="w-7 h-7" style={{ color: '#fff' }} />}
        </div>
      </div>

      {/* Camera button */}
      <button
        onClick={() => !isUploading && fileInputRef.current?.click()}
        disabled={isUploading}
        className="absolute bottom-0 right-0 flex items-center justify-center w-7 h-7 transition-opacity"
        style={{
          background: 'var(--accent)', color: '#000',
          border: '2px solid var(--bg)',
          cursor: isUploading ? 'wait' : 'pointer',
          opacity: isUploading ? 0.5 : 1,
        }}
        title="Изменить аватар"
      >
        <Camera className="w-3.5 h-3.5" />
      </button>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  );
}
