import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Minus, Plus, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useModel } from '../../context/ModelContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MATERIAL_DESC = {
  PLA:   'Экологичный, лёгкий в печати. Подходит для большинства задач.',
  ABS:   'Прочный и термостойкий. Хорош для функциональных деталей.',
  PETG:  'Баланс прочности и гибкости. Влагостойкий.',
  TPU:   'Гибкий и эластичный. Для мягких деталей и прокладок.',
  NYLON: 'Максимальная прочность и износостойкость.',
};

const QUALITY_DESC = {
  DRAFT:    'Быстрая печать, видимые слои. Для черновиков.',
  STANDARD: 'Баланс скорости и качества.',
  HIGH:     'Высокая детализация, гладкая поверхность.',
  ULTRA:    'Максимальная точность. Для миниатюр.',
};

const MATERIAL_COLORS = {
  PLA: '#34d399', ABS: '#f97316', PETG: '#3b82f6', TPU: '#8b5cf6', NYLON: '#9ca3af',
};

function Label({ children }) {
  return (
    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
      {children}
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: accent ? 'var(--accent)' : 'var(--text-1)', fontWeight: accent ? 600 : 400 }}>{value}</span>
    </div>
  );
}

export default function PriceCalculator() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { modelLoaded, calcParams, price, materials, qualities, updateCalcParams, calculatePrice } = useModel();

  const handleOrder = () => {
    if (!modelLoaded) { toast.error('Сначала загрузите 3D-модель'); return; }
    if (!isAuthenticated) { toast.error('Войдите в аккаунт для оформления заказа'); navigate('/login'); return; }
    navigate('/order');
  };

  const handleChange = (field, value) => updateCalcParams({ [field]: value });

  useEffect(() => { calculatePrice(); }, [calcParams, calculatePrice]);

  const mat = materials[calcParams.material];
  const qual = qualities[calcParams.quality];
  const weight = parseFloat(calcParams.weight) || 0;
  const infillFactor = 0.5 + (calcParams.infill / 100) * 0.5;
  const materialCost = weight * mat.pricePerG;
  const totalMaterialCost = materialCost * qual.multiplier * infillFactor;
  const baseCost = 200;
  const perItem = totalMaterialCost + baseCost;
  const total = perItem * calcParams.quantity;

  const infillLabel =
    calcParams.infill <= 20 ? 'Лёгкое' :
    calcParams.infill <= 50 ? 'Среднее' :
    calcParams.infill <= 80 ? 'Плотное' : 'Монолитное';

  const matColor = MATERIAL_COLORS[calcParams.material] || 'var(--accent)';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

      {/* ── Left: Controls ──────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* No model warning */}
        {!modelLoaded && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 16px', borderRadius: 12,
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: '#fbbf24', lineHeight: 1.6 }}>
              Загрузите 3D-модель для точного расчёта объёма и веса. Без модели цена приблизительная.
            </p>
          </div>
        )}

        {/* Material */}
        <div className="glass" style={{ borderRadius: 16, padding: '20px 20px 18px' }}>
          <Label>/ Материал</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(90px,1fr))', gap: 8, marginBottom: 10 }}>
            {Object.entries(materials).map(([key, m]) => {
              const col = MATERIAL_COLORS[key] || '#f97316';
              const active = calcParams.material === key;
              return (
                <button
                  key={key}
                  onClick={() => handleChange('material', key)}
                  style={{
                    padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
                    background: active ? `${col}18` : 'var(--surface)',
                    border: `1px solid ${active ? col + '60' : 'var(--border)'}`,
                    color: active ? col : 'var(--text-2)',
                    transition: 'all 0.2s ease', textAlign: 'center',
                    boxShadow: active ? `0 0 16px ${col}25` : 'none',
                  }}
                >
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: '0.05em', lineHeight: 1 }}>{m.name}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, marginTop: 3, opacity: 0.7 }}>
                    {(m.pricePerG * 1000).toFixed(0)} ₽/кг
                  </div>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>{MATERIAL_DESC[calcParams.material]}</p>
        </div>

        {/* Quality */}
        <div className="glass" style={{ borderRadius: 16, padding: '20px 20px 18px' }}>
          <Label>/ Качество печати</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 10 }}>
            {Object.entries(qualities).map(([key, q]) => {
              const active = calcParams.quality === key;
              return (
                <button
                  key={key}
                  onClick={() => handleChange('quality', key)}
                  style={{
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    background: active ? 'var(--accent-dim)' : 'var(--surface)',
                    border: `1px solid ${active ? 'rgba(249,115,22,0.4)' : 'var(--border)'}`,
                    color: active ? 'var(--accent)' : 'var(--text-2)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{q.name.split(' ')[0]}</div>
                  <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                    {q.name.split('(')[1]?.replace(')', '') || ''}
                  </div>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>{QUALITY_DESC[calcParams.quality]}</p>
        </div>

        {/* Infill */}
        <div className="glass" style={{ borderRadius: 16, padding: '20px 20px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Label>/ Заполнение</Label>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--accent)' }}>
              {calcParams.infill}% — {infillLabel}
            </span>
          </div>
          <input
            type="range" min="10" max="100" step="5"
            value={calcParams.infill}
            onChange={e => handleChange('infill', parseInt(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['10% лёгкое', '55% среднее', '100% монолит'].map(t => (
              <span key={t} style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.05em' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="glass" style={{ borderRadius: 16, padding: '20px 20px 18px' }}>
          <Label>/ Количество копий</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => handleChange('quantity', Math.max(1, calcParams.quantity - 1))}
              style={{
                width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
            >
              <Minus size={16} />
            </button>
            <input
              type="number" min="1" max="100"
              value={calcParams.quantity}
              onChange={e => handleChange('quantity', parseInt(e.target.value) || 1)}
              style={{
                flex: 1, textAlign: 'center', padding: '9px 12px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text-1)',
                fontFamily: 'DM Mono, monospace', fontSize: 16, fontWeight: 600,
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={() => handleChange('quantity', Math.min(100, calcParams.quantity + 1))}
              style={{
                width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: Price breakdown ───────────────── */}
      <div style={{ position: 'sticky', top: 80 }}>
        <div
          className="glass"
          style={{
            borderRadius: 20, overflow: 'hidden',
            border: `1px solid ${matColor}25`,
            boxShadow: `0 0 40px ${matColor}15`,
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 22px 16px',
            borderBottom: '1px solid var(--border)',
            background: `linear-gradient(135deg, ${matColor}10, transparent)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: matColor, boxShadow: `0 0 8px ${matColor}80` }} />
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Разбивка стоимости
              </span>
            </div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, letterSpacing: '0.04em', color: matColor, lineHeight: 1 }}>
              {price} ₽
            </div>
            {calcParams.quantity > 1 && (
              <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                {perItem.toFixed(0)} ₽ × {calcParams.quantity} шт.
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ padding: '16px 22px' }}>
            {modelLoaded && (
              <>
                <Row label="Объём модели" value={`${calcParams.volume} см³`} />
                <Row label="Масса материала" value={`${calcParams.weight} г`} />
              </>
            )}
            <Row label={`Материал (${mat.name})`} value={`${totalMaterialCost.toFixed(2)} ₽`} />
            {qual.multiplier !== 1 && (
              <Row label={`× коэф. качества ${qual.multiplier}`} value={`${(materialCost * qual.multiplier).toFixed(2)} ₽`} />
            )}
            <Row label="Работа (базовая)" value={`${baseCost} ₽`} />
            <Row label="1 изделие" value={`${perItem.toFixed(2)} ₽`} />
            {calcParams.quantity > 1 && (
              <Row label={`× ${calcParams.quantity} шт.`} value={`${total.toFixed(2)} ₽`} accent />
            )}
          </div>

          {/* Order button */}
          <div style={{ padding: '4px 22px 22px' }}>
            <button
              onClick={handleOrder}
              disabled={!modelLoaded || parseFloat(price) <= 0}
              style={{
                width: '100%', padding: '14px 0',
                borderRadius: 12, fontSize: 15, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: modelLoaded && parseFloat(price) > 0 ? 'pointer' : 'not-allowed',
                background: modelLoaded && parseFloat(price) > 0
                  ? 'linear-gradient(135deg, var(--accent), #fb923c)'
                  : 'var(--surface)',
                color: modelLoaded && parseFloat(price) > 0 ? '#fff' : 'var(--text-3)',
                border: 'none',
                boxShadow: modelLoaded && parseFloat(price) > 0 ? '0 4px 24px var(--accent-glow)' : 'none',
                transition: 'all 0.25s ease',
              }}
            >
              <ShoppingCart size={17} />
              {!modelLoaded ? 'Загрузите модель' : `Оформить заказ — ${price} ₽`}
            </button>
            {modelLoaded && (
              <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace', marginTop: 10, lineHeight: 1.5 }}>
                Нажимая кнопку, вы перейдёте к форме оформления заказа
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
