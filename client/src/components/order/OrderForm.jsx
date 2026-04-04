import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckCircle, Tag, X, AlertTriangle } from 'lucide-react';
import { useModel } from '../../context/ModelContext';
import { useAuth } from '../../context/AuthContext';
import * as ordersApi from '../../api/orders.api';
import { validatePromo } from '../../api/promo.api.js';

const inputBase = {
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
      {error && <p className="mt-1 font-sans text-xs" style={{ color: '#f87171' }}>⚠ {error}</p>}
    </div>
  );
}

export default function OrderForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { modelLoaded, modelData, calcParams, price, materials, qualities } = useModel();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: 'onChange',
    defaultValues: { name: user?.name || '', email: user?.email || '', phone: user?.phone || '', comments: '' },
  });

  const finalPrice = promoApplied
    ? Math.round(parseFloat(price) * (1 - promoApplied.discount / 100))
    : parseFloat(price);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await validatePromo(promoCode.trim());
      setPromoApplied(res.data);
      toast.success(`Промокод применён: −${res.data.discount}%`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Промокод не найден');
    } finally {
      setPromoLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!modelLoaded) { toast.error('Сначала загрузите 3D модель'); return; }
    setIsSubmitting(true);
    try {
      await ordersApi.createOrder({
        modelFile: modelData?.fileName || null,
        material: calcParams.material,
        quality: calcParams.quality,
        infill: calcParams.infill,
        quantity: calcParams.quantity,
        volume: parseFloat(calcParams.volume),
        weight: parseFloat(calcParams.weight),
        price: finalPrice,
        promoCode: promoApplied?.code || null,
        comments: data.comments || null,
      });
      setSubmitted(true);
      toast.success('Заказ оформлен!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      toast.error(error.message || 'Ошибка при оформлении заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass text-center" style={{ borderRadius: 20, padding: 'clamp(32px,6vw,48px)' }}>
        <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-5"
          style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}>
          <CheckCircle className="w-8 h-8" style={{ color: '#4ADE80' }} />
        </div>
        <h3 className="font-display tracking-widest text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>ЗАКАЗ ОФОРМЛЕН</h3>
        <p className="font-sans text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Мы свяжемся с вами в ближайшее время</p>
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Переход в личный кабинет...</p>
        <div className="flex justify-center mt-5">
          <div className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="glass" style={{ borderRadius: 20, padding: 'clamp(20px,4vw,32px)' }}>
      <div className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>/ оформление</div>
      <h3 className="font-display tracking-widest text-2xl mb-6" style={{ color: 'var(--text-primary)' }}>ЗАКАЗ</h3>

      {!modelLoaded && (
        <div className="flex items-start gap-3 mb-5 p-4"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <p className="font-sans text-sm" style={{ color: '#fbbf24', lineHeight: 1.6 }}>
            Сначала <a href="/upload" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>загрузите 3D модель</a> и рассчитайте стоимость
          </p>
        </div>
      )}

      {/* Order details */}
      <div className="mb-6 p-4" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-strong)' }}>
        <div className="font-mono text-xs tracking-wider uppercase mb-3" style={{ color: 'var(--text-muted)' }}>/ детали заказа</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
          {[
            ['Материал', materials[calcParams.material].name],
            ['Качество', qualities[calcParams.quality].name],
            ['Заполнение', `${calcParams.infill}%`],
            ['Количество', `${calcParams.quantity} шт.`],
            ['Объём / Вес', `${calcParams.volume} см³ / ${calcParams.weight} г`],
            ...(modelData?.fileName ? [['Файл', modelData.fileName]] : []),
          ].map(([label, val]) => (
            <div key={label} className="flex items-center justify-between col-span-1 sm:col-span-1"
              style={{ borderBottom: '1px solid var(--border)', paddingBottom: 6, paddingTop: 4 }}>
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span className="font-sans text-xs font-medium truncate ml-2" style={{ color: 'var(--text-primary)', maxWidth: 120 }}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          {promoApplied && (
            <div className="flex justify-between font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              <span>Без скидки:</span>
              <span style={{ textDecoration: 'line-through' }}>{price} ₽</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Итого</span>
            <span className="font-display tracking-widest text-2xl" style={{ color: 'var(--accent)' }}>{finalPrice} ₽</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Имя *" error={errors.name?.message}>
          <input type="text" {...register('name', { required: 'Имя обязательно', minLength: { value: 2, message: 'Минимум 2 символа' } })}
            style={{ ...inputBase, borderColor: errors.name ? '#f87171' : 'var(--border-strong)' }}
            placeholder="Иван Иванов" disabled={isSubmitting}
            onFocus={e => { if (!errors.name) e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={e => { if (!errors.name) e.target.style.borderColor = 'var(--border-strong)'; }} />
        </Field>

        <Field label="Email *" error={errors.email?.message}>
          <input type="email" {...register('email', { required: 'Email обязателен', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Некорректный email' } })}
            style={{ ...inputBase, borderColor: errors.email ? '#f87171' : 'var(--border-strong)' }}
            placeholder="ivan@example.com" disabled={isSubmitting}
            onFocus={e => { if (!errors.email) e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={e => { if (!errors.email) e.target.style.borderColor = 'var(--border-strong)'; }} />
        </Field>

        <Field label="Телефон *" error={errors.phone?.message}>
          <input type="tel" {...register('phone', { required: 'Телефон обязателен', pattern: { value: /^[\d\s\-\+\(\)]{7,}$/, message: 'Некорректный номер' } })}
            style={{ ...inputBase, borderColor: errors.phone ? '#f87171' : 'var(--border-strong)' }}
            placeholder="+7 (999) 123-45-67" disabled={isSubmitting}
            onFocus={e => { if (!errors.phone) e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={e => { if (!errors.phone) e.target.style.borderColor = 'var(--border-strong)'; }} />
        </Field>

        <Field label="Комментарий" error={null}>
          <textarea {...register('comments')}
            rows={3} style={{ ...inputBase, resize: 'vertical' }}
            placeholder="Дополнительные пожелания, адрес доставки, особые требования..."
            disabled={isSubmitting}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-strong)'} />
        </Field>

        {/* Promo */}
        <div>
          <div className="font-mono text-xs tracking-wider uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Промокод</div>
          {promoApplied ? (
            <div className="flex items-center gap-2 p-3"
              style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)' }}>
              <Tag className="w-4 h-4 shrink-0" style={{ color: '#4ADE80' }} />
              <span className="font-mono text-xs flex-1" style={{ color: '#4ADE80' }}>{promoApplied.code} — скидка {promoApplied.discount}%</span>
              <button type="button" onClick={() => setPromoApplied(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4ADE80', padding: 2 }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Введите промокод..."
                style={{ ...inputBase, flex: 1, textTransform: 'uppercase', fontSize: 13 }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-strong)'} />
              <button type="button" onClick={applyPromo} disabled={!promoCode.trim() || promoLoading}
                className="font-mono text-xs px-4 py-2 transition-opacity"
                style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', cursor: !promoCode.trim() ? 'not-allowed' : 'pointer', opacity: !promoCode.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}>
                {promoLoading ? '...' : 'Применить'}
              </button>
            </div>
          )}
        </div>

        <button type="submit" disabled={!modelLoaded || isSubmitting}
          className="w-full flex items-center justify-center gap-2 font-sans font-semibold text-sm transition-all"
          style={{
            padding: '14px 0',
            background: modelLoaded && !isSubmitting ? 'linear-gradient(135deg,var(--accent),#fb923c)' : 'var(--bg-raised)',
            color: modelLoaded && !isSubmitting ? '#fff' : 'var(--text-muted)',
            border: 'none', cursor: !modelLoaded || isSubmitting ? 'not-allowed' : 'pointer',
            boxShadow: modelLoaded && !isSubmitting ? '0 4px 24px var(--accent-glow)' : 'none',
          }}>
          {isSubmitting ? (
            <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Оформление...</>
          ) : (
            `Оформить заказ — ${finalPrice} ₽`
          )}
        </button>
      </form>

      <div className="mt-5 pt-5 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
        {[
          'После оформления мы свяжемся с вами в течение 1 часа',
          'Срок изготовления: 24–48 ч с момента подтверждения',
        ].map((text, i) => (
          <p key={i} className="font-sans text-xs flex items-start gap-2" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <span style={{ color: 'var(--accent)', flexShrink: 0 }}>—</span>
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
