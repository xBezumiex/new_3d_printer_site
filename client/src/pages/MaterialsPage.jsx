import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const MATERIALS = [
  {
    id: 'pla', name: 'PLA', fullName: 'Polylactic Acid',
    badge: 'Рекомендуется новичкам', tagline: 'Самый популярный материал для начинающих',
    description: 'PLA — биоразлагаемый термопласт на основе молочной кислоты. Прост в печати, не требует подогревного стола, даёт минимальную усадку. Идеален для декоративных изделий, прототипов и учебных проектов.',
    props: { temp: '190–220 °C', bed: '20–60 °C', density: '1.24 г/см³', strength: 'Средняя' },
    pros: ['Лёгкая печать', 'Нет запаха', 'Биоразлагаем', 'Низкая усадка', 'Широкий выбор цветов'],
    cons: ['Низкая термостойкость', 'Хрупкость при ударе', 'Боится влаги'],
    uses: ['Игрушки и сувениры', 'Прототипы', 'Декор', 'Образовательные модели'],
    color: '#34d399', glow: 'rgba(52,211,153,0.2)',
    ratings: { s: 2, f: 1, t: 1, e: 5, p: 1 },
  },
  {
    id: 'abs', name: 'ABS', fullName: 'Acrylonitrile Butadiene Styrene',
    badge: 'Для функциональных деталей', tagline: 'Прочный и термостойкий материал',
    description: 'ABS — один из самых распространённых инженерных пластиков. Отличается хорошей ударопрочностью и термостойкостью. Позволяет постобработку ацетоном для глянцевой поверхности.',
    props: { temp: '220–250 °C', bed: '80–110 °C', density: '1.04 г/см³', strength: 'Высокая' },
    pros: ['Высокая прочность', 'Термостойкость до 80–100 °C', 'Постобработка ацетоном', 'Хорошая гибкость'],
    cons: ['Запах при печати', 'Нужен обогревный стол', 'Усадка и коробление'],
    uses: ['Корпуса электроники', 'Автодетали', 'Инструменты', 'Бытовые изделия'],
    color: '#f97316', glow: 'rgba(249,115,22,0.2)',
    ratings: { s: 4, f: 2, t: 4, e: 3, p: 2 },
  },
  {
    id: 'petg', name: 'PETG', fullName: 'Polyethylene Terephthalate Glycol',
    badge: 'Лучшее соотношение цены и качества', tagline: 'Прочность ABS + простота PLA',
    description: 'PETG сочетает лучшие свойства PLA и ABS: высокую прочность, термостойкость и простоту печати. Пищебезопасен, водостойкий, не боится влаги.',
    props: { temp: '230–250 °C', bed: '70–85 °C', density: '1.27 г/см³', strength: 'Очень высокая' },
    pros: ['Прочность выше ABS', 'Пищебезопасен', 'Водостойкость', 'Хорошая адгезия слоёв', 'Минимальный запах'],
    cons: ['Нити при печати', 'Трудно шлифовать', 'Требует сушки'],
    uses: ['Ёмкости для жидкостей', 'Медицинские изделия', 'Механические детали', 'Наружные конструкции'],
    color: '#3b82f6', glow: 'rgba(59,130,246,0.2)',
    ratings: { s: 4, f: 2, t: 3, e: 4, p: 2 },
  },
  {
    id: 'tpu', name: 'TPU', fullName: 'Thermoplastic Polyurethane',
    badge: 'Гибкий материал', tagline: 'Для эластичных и ударопоглощающих деталей',
    description: 'TPU — гибкий и эластичный термопластичный полиуретан. Незаменим там, где нужна упругость, ударопоглощение или стойкость к истиранию.',
    props: { temp: '220–240 °C', bed: '30–60 °C', density: '1.21 г/см³', strength: 'Средняя (гибкий)' },
    pros: ['Высокая эластичность', 'Ударопрочность', 'Стойкость к истиранию', 'Водо- и маслостойкость'],
    cons: ['Сложная печать', 'Медленная скорость', 'Требует прямой подачи'],
    uses: ['Чехлы для телефонов', 'Уплотнители', 'Обувные стельки', 'Прокладки', 'Игрушки'],
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.2)',
    ratings: { s: 2, f: 5, t: 2, e: 2, p: 3 },
  },
  {
    id: 'nylon', name: 'Nylon', fullName: 'Polyamide (PA)',
    badge: 'Для профессиональных задач', tagline: 'Максимальная прочность и износостойкость',
    description: 'Нейлон — инженерный материал с исключительной прочностью и износостойкостью. Применяется в промышленности для деталей, испытывающих высокие нагрузки.',
    props: { temp: '240–260 °C', bed: '70–90 °C', density: '1.15 г/см³', strength: 'Максимальная' },
    pros: ['Высочайшая прочность', 'Износостойкость', 'Хим. стойкость', 'Гибкость под нагрузкой'],
    cons: ['Сильно впитывает влагу', 'Сложная печать', 'Коробление', 'Требует сушки'],
    uses: ['Шестерни', 'Подшипники', 'Инструменты', 'Промышленные детали', 'Протезы'],
    color: '#9ca3af', glow: 'rgba(156,163,175,0.15)',
    ratings: { s: 5, f: 3, t: 5, e: 1, p: 4 },
  },
];

const RATING_LABELS = { s: 'Прочность', f: 'Гибкость', t: 'Термостойкость', e: 'Простота', p: 'Цена' };

function RatingBar({ value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--surface)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${(value / 5) * 100}%`,
          background: color,
          borderRadius: 2,
          boxShadow: `0 0 6px ${color}80`,
          transition: 'width 0.6s cubic-bezier(.22,1,.36,1)',
        }} />
      </div>
      <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-3)', minWidth: 12 }}>{value}/5</span>
    </div>
  );
}

export default function MaterialsPage() {
  const [selected, setSelected] = useState(null);

  const mat = selected ? MATERIALS.find(m => m.id === selected) : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
            / материалы
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(2.5rem,6vw,4.5rem)', letterSpacing: '0.05em', color: 'var(--text-1)', lineHeight: 1, marginBottom: 12 }}>
            МАТЕРИАЛЫ ДЛЯ 3D-ПЕЧАТИ
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-2)', maxWidth: 500, lineHeight: 1.7 }}>
            Выберите материал, чтобы узнать его характеристики, преимущества и область применения
          </p>
        </div>

        {/* Material selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
          {MATERIALS.map(m => {
            const active = selected === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelected(active ? null : m.id)}
                style={{
                  padding: '12px 20px', borderRadius: 12,
                  background: active ? `${m.color}18` : 'var(--surface)',
                  border: `1px solid ${active ? m.color + '50' : 'var(--border)'}`,
                  color: active ? m.color : 'var(--text-2)',
                  fontFamily: 'Bebas Neue, sans-serif',
                  fontSize: 22, letterSpacing: '0.06em',
                  cursor: 'pointer',
                  boxShadow: active ? `0 0 20px ${m.glow}` : 'none',
                  transition: 'all 0.25s ease',
                  transform: active ? 'translateY(-2px)' : 'none',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = m.color + '40'; e.currentTarget.style.color = m.color; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; } }}
              >
                {m.name}
              </button>
            );
          })}
        </div>

        {/* Detail card */}
        {mat && (
          <div
            className="glass"
            style={{
              borderRadius: 24, overflow: 'hidden', marginBottom: 36,
              border: `1px solid ${mat.color}30`,
              boxShadow: `0 0 60px ${mat.glow}`,
              animation: 'fadeUp 0.35s ease both',
            }}
          >
            {/* Card header */}
            <div style={{
              padding: '32px 32px 28px',
              background: `linear-gradient(135deg, ${mat.color}15, transparent)`,
              borderBottom: `1px solid ${mat.color}20`,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
            }}>
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 56, letterSpacing: '0.05em', color: mat.color, lineHeight: 1, marginBottom: 4 }}>{mat.name}</h2>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 8 }}>{mat.fullName}</p>
                <p style={{ fontSize: 16, color: 'var(--text-1)', fontWeight: 500 }}>{mat.tagline}</p>
              </div>
              <span style={{
                padding: '6px 14px', borderRadius: 100,
                background: `${mat.color}15`,
                border: `1px solid ${mat.color}30`,
                color: mat.color,
                fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
              }}>
                {mat.badge}
              </span>
            </div>

            <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 28 }}>
              {/* Description */}
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>{mat.description}</p>
              </div>

              {/* Technical props */}
              <div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>
                  / Технические параметры
                </div>
                {Object.entries({ 'Температура сопла': mat.props.temp, 'Температура стола': mat.props.bed, 'Плотность': mat.props.density, 'Прочность': mat.props.strength }).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{k}</span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: mat.color }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Uses */}
              <div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>
                  / Применение
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {mat.uses.map(u => (
                    <span key={u} style={{
                      padding: '5px 12px', borderRadius: 6,
                      background: `${mat.color}12`, border: `1px solid ${mat.color}25`,
                      color: mat.color, fontSize: 12, fontWeight: 500,
                    }}>{u}</span>
                  ))}
                </div>
              </div>

              {/* Pros */}
              <div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>
                  / Преимущества
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mat.pros.map(p => (
                    <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
                      <span style={{ color: '#34d399', fontFamily: 'DM Mono, monospace' }}>+</span> {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>
                  / Недостатки
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mat.cons.map(c => (
                    <li key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
                      <span style={{ color: '#f87171', fontFamily: 'DM Mono, monospace' }}>−</span> {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ratings */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
                  / Характеристики
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
                  {Object.entries(RATING_LABELS).map(([key, label]) => (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{label}</span>
                      </div>
                      <RatingBar value={mat.ratings[key]} color={mat.color} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison table */}
        <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)' }}>/ сравнение</div>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: '0.06em', color: 'var(--text-1)' }}>СРАВНЕНИЕ МАТЕРИАЛОВ</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Материал', 'Прочность', 'Гибкость', 'Термостойкость', 'Простота', 'Цена'].map((h, i) => (
                    <th key={h} style={{
                      padding: '12px 16px',
                      fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.15em',
                      textTransform: 'uppercase', color: 'var(--text-3)',
                      textAlign: i === 0 ? 'left' : 'center',
                      background: 'var(--surface)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATERIALS.map((m, ri) => (
                  <tr
                    key={m.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: selected === m.id ? `${m.color}06` : 'transparent',
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelected(selected === m.id ? null : m.id)}
                    onMouseEnter={e => { if (selected !== m.id) e.currentTarget.style.background = 'var(--surface)'; }}
                    onMouseLeave={e => { if (selected !== m.id) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, boxShadow: `0 0 8px ${m.color}80`, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: '0.06em', color: m.color }}>{m.name}</span>
                      </div>
                    </td>
                    {['s', 'f', 't', 'e', 'p'].map(key => (
                      <td key={key} style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                          {[1,2,3,4,5].map(i => (
                            <div key={i} style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: i <= m.ratings[key] ? m.color : 'var(--surface)',
                              boxShadow: i <= m.ratings[key] ? `0 0 4px ${m.color}60` : 'none',
                            }} />
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
