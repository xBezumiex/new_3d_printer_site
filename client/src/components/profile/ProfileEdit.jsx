import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import * as usersApi from '../../api/users.api';
import * as authApi from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';

const inputStyle = {
  width: '100%', padding: '9px 14px',
  background: 'var(--bg-raised)', border: '1px solid var(--border-strong)',
  color: 'var(--text-primary)', fontSize: 14, outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
};

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block font-mono text-xs tracking-wider uppercase mb-2" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
      {error && <p className="mt-1 font-sans text-xs" style={{ color: '#f87171' }}>{error}</p>}
    </div>
  );
}

export default function ProfileEdit({ user, onClose, onUpdate }) {
  const { updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: user.name || '', phone: user.phone || '', bio: user.bio || '' },
  });

  const { register: regPwd, handleSubmit: handlePwd, formState: { errors: pwdErrors, isSubmitting: pwdSubmitting }, watch, reset: resetPwd } = useForm();

  const onSubmitProfile = async (data) => {
    try {
      const response = await usersApi.updateUserProfile(user.id, data);
      const updatedUser = response.data?.data?.user || response.data?.user;
      updateUser(updatedUser);
      toast.success('Профиль обновлён');
      onUpdate(updatedUser);
      onClose();
    } catch (e) {
      toast.error(e?.message || 'Не удалось обновить профиль');
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Пароль успешно изменён');
      resetPwd();
      setTab('profile');
    } catch (e) {
      toast.error(e?.message || 'Неверный текущий пароль');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="glass w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ borderRadius: 16, animation: 'fadeUp 0.25s ease both' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-display tracking-widest text-xl" style={{ color: 'var(--text-primary)' }}>
            РЕДАКТИРОВАТЬ ПРОФИЛЬ
          </h2>
          <button onClick={onClose} className="p-1 transition-colors"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
          {[['profile', 'Профиль'], ['password', 'Пароль']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex-1 py-3 font-mono text-xs tracking-wider uppercase transition-colors"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: tab === key ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: tab === key ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
              {key === 'password' && <Lock className="w-3.5 h-3.5 inline mr-1.5" />}{label}
            </button>
          ))}
        </div>

        {/* Profile form */}
        {tab === 'profile' && (
          <form onSubmit={handleSubmit(onSubmitProfile)} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Имя *" error={errors.name?.message}>
              <input type="text" {...register('name', { required: 'Имя обязательно', minLength: { value: 2, message: 'Минимум 2 символа' } })}
                style={inputStyle} placeholder="Ваше имя"
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-strong)'} />
            </Field>
            <Field label="Телефон" error={errors.phone?.message}>
              <input type="tel" {...register('phone', { pattern: { value: /^[\d\s\-\+\(\)]+$/, message: 'Некорректный номер' } })}
                style={inputStyle} placeholder="+7 (XXX) XXX-XX-XX"
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-strong)'} />
            </Field>
            <Field label="О себе" error={errors.bio?.message}>
              <textarea {...register('bio', { maxLength: { value: 500, message: 'Максимум 500 символов' } })}
                rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Расскажите о себе..."
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-strong)'} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 font-sans font-medium text-sm transition-colors"
                style={{ padding: '10px 0', background: 'var(--glass-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Отмена
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex-1 font-sans font-semibold text-sm transition-opacity"
                style={{ padding: '10px 0', background: 'var(--accent)', color: '#000', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        )}

        {/* Password form */}
        {tab === 'password' && (
          <form onSubmit={handlePwd(onSubmitPassword)} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { id: 'currentPassword', label: 'Текущий пароль', show: showCurrent, toggle: () => setShowCurrent(v => !v),
                ref: regPwd('currentPassword', { required: 'Введите текущий пароль' }), err: pwdErrors.currentPassword },
              { id: 'newPassword', label: 'Новый пароль', show: showNew, toggle: () => setShowNew(v => !v),
                ref: regPwd('newPassword', { required: 'Введите новый пароль', minLength: { value: 6, message: 'Минимум 6 символов' } }), err: pwdErrors.newPassword },
              { id: 'confirmPassword', label: 'Подтвердите пароль', show: showConfirm, toggle: () => setShowConfirm(v => !v),
                ref: regPwd('confirmPassword', { required: 'Подтвердите пароль', validate: v => v === watch('newPassword') || 'Пароли не совпадают' }), err: pwdErrors.confirmPassword },
            ].map(({ id, label, show, toggle, ref, err }) => (
              <Field key={id} label={label} error={err?.message}>
                <div style={{ position: 'relative' }}>
                  <input type={show ? 'text' : 'password'} {...ref}
                    style={{ ...inputStyle, paddingRight: 40 }} placeholder="••••••••"
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-strong)'} />
                  <button type="button" onClick={toggle}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
            ))}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 font-sans font-medium text-sm transition-colors"
                style={{ padding: '10px 0', background: 'var(--glass-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Отмена
              </button>
              <button type="submit" disabled={pwdSubmitting}
                className="flex-1 font-sans font-semibold text-sm transition-opacity"
                style={{ padding: '10px 0', background: 'var(--accent)', color: '#000', border: 'none', cursor: pwdSubmitting ? 'not-allowed' : 'pointer', opacity: pwdSubmitting ? 0.6 : 1 }}>
                {pwdSubmitting ? 'Сохранение...' : 'Изменить пароль'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
