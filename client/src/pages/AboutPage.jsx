import { Link } from 'react-router-dom';
import { Printer, Users, Award, Zap, ArrowRight } from 'lucide-react';

const STATS = [
  { value: '500+', label: 'Выполненных заказов', sub: 'с 2019 года' },
  { value: '5',    label: 'Лет на рынке',        sub: 'г. Москва' },
  { value: '12',   label: 'Принтеров в парке',    sub: 'FDM + SLA' },
  { value: '98%',  label: 'Довольных клиентов',   sub: 'по опросам' },
];

const TEAM = [
  { name: 'Алексей Соколов', role: 'Основатель & Технический директор', desc: '10+ лет опыта в аддитивных технологиях. Специализация на промышленной 3D-печати.', initials: 'АС', color: '#4F8EF7' },
  { name: 'Мария Петрова',   role: 'Главный дизайнер',                   desc: 'Мастер 3D-моделирования в Blender и Fusion 360. Помогает клиентам адаптировать модели.', initials: 'МП', color: '#FF4D00' },
  { name: 'Дмитрий Ковалёв', role: 'Инженер по постобработке',           desc: 'Эксперт по шлифовке, окраске и финишной обработке. Превращает распечатки в идеальные изделия.', initials: 'ДК', color: '#4ADE80' },
];

const EQUIPMENT = [
  { name: 'Bambu Lab X1 Carbon', count: 4, desc: 'Высокоскоростные принтеры с мультиматериальной печатью' },
  { name: 'Prusa i3 MK3S+',      count: 5, desc: 'Надёжные и точные принтеры для качественной печати' },
  { name: 'Voron 2.4',           count: 2, desc: 'Высокотемпературные принтеры для инженерных материалов' },
  { name: 'Elegoo Saturn (SLA)', count: 1, desc: 'Фотополимерная печать для ювелирных деталей' },
];

const VALUES = [
  { icon: Award,   title: 'Качество',   desc: 'Каждый заказ проходит визуальный и размерный контроль перед отправкой', color: '#FACC15' },
  { icon: Zap,     title: 'Скорость',   desc: 'Стандартные заказы за 24–48 ч. Срочная печать в день обращения',         color: '#4F8EF7' },
  { icon: Users,   title: 'Поддержка',  desc: 'Помогаем выбрать материал и настройки. Консультируем бесплатно',         color: '#4ADE80' },
  { icon: Printer, title: 'Точность',   desc: 'Отклонение размеров не превышает ±0.2 мм. Калиброванное оборудование',   color: '#C084FC' },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Hero */}
      <section className="relative overflow-hidden mesh-bg grid-overlay" style={{ borderBottom: '1px solid var(--border)', padding: '80px 0 64px' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full animate-pulse-glow"
            style={{ background: 'radial-gradient(circle, rgba(255,77,0,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <p className="font-mono text-xs tracking-widest2 uppercase mb-4" style={{ color: 'var(--accent)' }}>/ о нас</p>
          <h1 className="font-display tracking-widest mb-6" style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            3D PRINT LAB
          </h1>
          <p className="font-sans text-lg leading-relaxed mx-auto mb-10" style={{ color: 'var(--text-secondary)', maxWidth: 560 }}>
            Профессиональная 3D-печать в Москве. С 2019 года воплощаем идеи клиентов —
            от небольших прототипов до серийного производства.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/upload" className="btn-primary flex items-center gap-2 px-8 py-3.5 font-sans font-semibold"
              style={{ background: 'var(--accent)', color: '#000' }}>
              Заказать печать <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/calculator" className="glass btn-ghost flex items-center gap-2 px-8 py-3.5 font-sans font-medium"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}>
              Рассчитать стоимость
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={s.label} className="px-8 py-10 text-center relative group"
                style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(255,77,0,0.04) 0%, transparent 70%)' }} />
                <p className="font-display text-5xl mb-1" style={{ color: 'var(--accent)' }}>{s.value}</p>
                <p className="font-sans text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{s.label}</p>
                <p className="font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-widest2 uppercase mb-4" style={{ color: 'var(--accent)' }}>/ история</p>
          <h2 className="font-display tracking-widest mb-10" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            НАША ИСТОРИЯ
          </h2>
          <div className="glass p-8 space-y-5" style={{ borderLeft: '2px solid var(--accent)' }}>
            <p className="font-sans leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>3D Print Lab</span> был основан в 2019 году
              группой инженеров и дизайнеров, влюблённых в аддитивные технологии. Мы начинали с двух принтеров
              в небольшой мастерской и выполняли заказы для студентов и небольших компаний.
            </p>
            <p className="font-sans leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Сегодня наш парк насчитывает 12 профессиональных принтеров различных классов. Мы работаем как с
              частными клиентами, так и с предприятиями — создаём прототипы, серийные детали, изделия на заказ.
            </p>
            <p className="font-sans leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Наша миссия — сделать 3D-печать доступной для каждого. Загрузите модель, рассчитайте стоимость
              и оформите заказ без звонков и ожидания.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest2 uppercase mb-4" style={{ color: 'var(--accent)' }}>/ принципы</p>
            <h2 className="font-display tracking-widest" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
              НАШИ ПРИНЦИПЫ
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass glass-hover grad-border p-6 text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-sans font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="font-sans text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="py-24 container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs tracking-widest2 uppercase mb-4" style={{ color: 'var(--accent)' }}>/ оборудование</p>
          <h2 className="font-display tracking-widest mb-12" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            НАШ ПАРК
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {EQUIPMENT.map(e => (
              <div key={e.name} className="glass glass-hover p-5 flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center shrink-0"
                  style={{ background: 'var(--accent-dim)', border: '1px solid rgba(255,77,0,0.2)' }}>
                  <Printer className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-sans font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{e.name}</h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 tracking-wider"
                      style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(255,77,0,0.2)' }}>
                      ×{e.count}
                    </span>
                  </div>
                  <p className="font-sans text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="font-mono text-xs tracking-widest2 uppercase mb-4" style={{ color: 'var(--accent)' }}>/ команда</p>
            <h2 className="font-display tracking-widest" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
              НАША КОМАНДА
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {TEAM.map(m => (
              <div key={m.name} className="glass glass-hover grad-border p-8 text-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${m.color}20`, border: `1px solid ${m.color}40`, color: m.color }}>
                  {m.initials}
                </div>
                <h3 className="font-sans font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{m.name}</h3>
                <p className="font-mono text-[11px] tracking-wider mb-3" style={{ color: m.color }}>{m.role}</p>
                <p className="font-sans text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 container mx-auto px-6 text-center">
        <div className="glass max-w-2xl mx-auto p-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,77,0,0.06) 0%, transparent 70%)' }} />
          <p className="font-mono text-xs tracking-widest2 uppercase mb-4" style={{ color: 'var(--accent)' }}>/ начать</p>
          <h2 className="font-display tracking-widest mb-4" style={{ fontSize: 'clamp(1.5rem,4vw,2.5rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            ГОТОВЫ НАЧАТЬ?
          </h2>
          <p className="font-sans mb-8" style={{ color: 'var(--text-secondary)' }}>
            Загрузите вашу 3D-модель, рассчитайте стоимость и оформите заказ за 5 минут
          </p>
          <Link to="/upload" className="btn-primary inline-flex items-center gap-2 px-10 py-4 font-sans font-semibold"
            style={{ background: 'var(--accent)', color: '#000' }}>
            Загрузить модель <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
