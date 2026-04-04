import { useState } from 'react';
import { ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    category: 'Общие вопросы',
    items: [
      { q: 'Что такое FDM 3D-печать?', a: 'FDM (Fused Deposition Modeling) — наиболее распространённая технология 3D-печати. Принтер расплавляет пластиковую нить и наносит её слой за слоем, формируя трёхмерный объект. Это быстрый, доступный и универсальный способ прототипирования и изготовления изделий.' },
      { q: 'Какие форматы файлов вы принимаете?', a: 'Принимаем файлы в форматах STL, OBJ и 3MF. Наиболее популярен STL — он поддерживается практически всеми программами: Blender, Fusion 360, TinkerCAD, SolidWorks.' },
      { q: 'Как долго печатается модель?', a: 'Время зависит от размера и сложности: маленькие фигурки — 1–3 часа, средние изделия — 5–15 часов, крупные конструкции — от суток. После оформления заказа менеджер сообщит ориентировочные сроки.' },
      { q: 'Можно ли напечатать несколько одинаковых деталей?', a: 'Да, укажите нужное количество при оформлении заказа. При больших тиражах мы предоставляем скидки — уточняйте у менеджера.' },
    ],
  },
  {
    category: 'Материалы',
    items: [
      { q: 'Какой материал выбрать?', a: 'Зависит от назначения: PLA — для декора и прототипов. ABS — для прочных деталей. PETG — универсальный, пищебезопасный. TPU — для гибких деталей. Nylon — для нагруженных механических компонентов.' },
      { q: 'Из каких материалов можно изготовить пищеконтактные изделия?', a: 'Для пищевых изделий подходит PETG — он сертифицирован как пищебезопасный. Поры между слоями могут накапливать бактерии, поэтому рекомендуется использовать с защитным покрытием.' },
      { q: 'Насколько прочные изделия из 3D-печати?', a: 'Прочность зависит от материала и параметров. Детали из PETG или Nylon с заполнением 60–80% сравнимы с промышленными пластиками. PLA при высоких нагрузках или температурах менее предпочтителен.' },
    ],
  },
  {
    category: 'Оплата и доставка',
    items: [
      { q: 'Как рассчитывается стоимость?', a: 'Автоматически в калькуляторе: (вес модели в граммах) × (цена за грамм материала) × (коэффициент качества) × количество. Финальная цена подтверждается менеджером.' },
      { q: 'Какие способы оплаты доступны?', a: 'Принимаем наличные при самовывозе, перевод на карту и безналичный расчёт для организаций. Оплата после подтверждения заказа.' },
      { q: 'Есть ли доставка?', a: 'Отправляем курьерскими службами по всей России (СДЭК, Почта России). Стоимость рассчитывается по весу и региону. Также доступен самовывоз из мастерской.' },
    ],
  },
  {
    category: 'Технические вопросы',
    items: [
      { q: 'Что такое заполнение (infill)?', a: 'Процент внутренней структуры, заполненной пластиком. 20–40% — лёгкость, 60–80% — прочность, 100% — полностью сплошная деталь.' },
      { q: 'Что такое качество печати (разрешение)?', a: 'Определяется высотой слоя: Черновик (0.3 мм), Стандарт (0.2 мм), Высокое (0.15 мм), Ультра (0.1 мм) — максимальная детализация.' },
      { q: 'Нужны ли поддержки для печати?', a: 'Нужны для навесных элементов под углом более 45°. Мы автоматически определяем необходимость поддержек — это влияет на расход материала и стоимость.' },
      { q: 'Можно ли окрасить готовое изделие?', a: 'Да. После печати можно шлифовать, грунтовать и красить акриловыми красками. ABS поддаётся обработке ацетоном для глянцевой поверхности. Постобработка доступна за доп. плату.' },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }} className="last:border-0">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group transition-colors"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <span className="font-sans text-sm font-medium transition-colors duration-200"
          style={{ color: open ? 'var(--text-primary)' : 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = open ? 'var(--text-primary)' : 'var(--text-secondary)'}>
          {q}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
          : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
        }
      </button>
      {open && (
        <div className="pb-4 font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '48px 0 32px' }}>
        <div className="container mx-auto px-6 text-center">
          <p className="font-mono text-xs tracking-widest2 uppercase mb-3" style={{ color: 'var(--accent)' }}>/ справка</p>
          <h1 className="font-display tracking-widest mb-3" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            FAQ
          </h1>
          <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
            Не нашли ответа?{' '}
            <Link to="/contact" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Напишите нам</Link>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="space-y-4">
          {FAQS.map(section => (
            <div key={section.category} className="glass overflow-hidden">
              {/* Category header */}
              <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                <h2 className="font-mono text-xs tracking-widest2 uppercase" style={{ color: 'var(--text-muted)' }}>
                  {section.category}
                </h2>
              </div>
              <div className="px-6">
                {section.items.map(item => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
