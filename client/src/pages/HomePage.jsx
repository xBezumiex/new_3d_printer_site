import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Calculator, Package, ArrowRight, ArrowUpRight, Zap, Shield, Cpu, Headphones } from 'lucide-react';
import { getPosts } from '../api/posts.api';
import PostCard from '../components/posts/PostCard';

const STATS = [
  { value: 500,  suffix: '+', label: 'Выполненных заказов', sub: 'с 2019 года' },
  { value: 5,    suffix: '',  label: 'Лет на рынке',        sub: 'г. Москва' },
  { value: 12,   suffix: '',  label: 'Принтеров',            sub: 'FDM + SLA' },
  { value: 98,   suffix: '%', label: 'Довольных клиентов',  sub: 'по опросам' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: Upload,     title: 'Загрузите модель',      desc: 'STL, OBJ или 3MF — напрямую на сайте, без лишних шагов' },
  { step: '02', icon: Calculator, title: 'Рассчитайте стоимость', desc: 'Выберите материал, качество и заполнение — цена мгновенно' },
  { step: '03', icon: Package,    title: 'Получите заказ',        desc: 'Оформите онлайн и следите за статусом в личном кабинете' },
];

const MATERIALS = [
  { name: 'PLA',   desc: 'Лёгкий в печати',       temp: '200°C', color: '#4ADE80', glow: 'rgba(74,222,128,0.25)' },
  { name: 'ABS',   desc: 'Прочный, термостойкий',  temp: '240°C', color: '#FB923C', glow: 'rgba(251,146,60,0.25)' },
  { name: 'PETG',  desc: 'Универсальный',           temp: '230°C', color: '#38BDF8', glow: 'rgba(56,189,248,0.25)' },
  { name: 'TPU',   desc: 'Гибкий',                  temp: '220°C', color: '#C084FC', glow: 'rgba(192,132,252,0.25)' },
  { name: 'Nylon', desc: 'Максимальная прочность',  temp: '260°C', color: '#F5F0E8', glow: 'rgba(245,240,232,0.2)' },
];

const FEATURES = [
  { icon: Zap,        title: 'Быстро',         desc: 'Стандартные заказы за 24–48 ч', color: '#FACC15' },
  { icon: Shield,     title: 'Надёжно',        desc: 'Контроль качества на каждом этапе', color: '#4F8EF7' },
  { icon: Cpu,        title: '12 принтеров',   desc: 'FDM и SLA, широкий выбор материалов', color: '#C084FC' },
  { icon: Headphones, title: 'Поддержка 24/7', desc: 'Консультируем на каждом этапе', color: '#4ADE80' },
];

const REVIEWS = [
  { name: 'Дмитрий К.', role: 'Прототипирование', text: 'Заказал корпус — всё точь-в-точь по размерам. Качество на уровне промышленной печати.', rating: 5 },
  { name: 'Анна М.',    role: 'Дизайн-проект',     text: 'Быстро, качественно. Калькулятор показывает всё прозрачно до копейки. Очень удобно.', rating: 5 },
  { name: 'Сергей П.',  role: 'Запчасти',          text: 'Напечатали деталь, которую нигде нельзя купить. Подошла идеально с первого раза.', rating: 5 },
];

/* ── Intersection observer hook ── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.unobserve(el); }
    }, { threshold: 0.1, ...options });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

/* ── Animated counter ── */
function Counter({ target, suffix, active }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const duration = 1800;
    const startTime = performance.now();
    const tick = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setCount(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [active, target]);
  return <>{count}{suffix}</>;
}

/* ── Floating particles ── */
function Particles() {
  const particles = useRef(
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 8,
      duration: Math.random() * 6 + 6,
      color: i % 4 === 0 ? 'rgba(255,77,0,0.6)' : i % 4 === 1 ? 'rgba(79,142,247,0.4)' : i % 4 === 2 ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.15)',
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `particle ${p.duration}s ${p.delay}s ease-in-out infinite`,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Scan line ── */
function ScanLine() {
  return (
    <div
      className="absolute left-0 right-0 pointer-events-none z-10"
      style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,77,0,0.3), rgba(255,77,0,0.6), rgba(255,77,0,0.3), transparent)',
        animation: 'scan 8s 2s linear infinite',
        top: 0,
      }}
    />
  );
}

/* ── Decorative 3D geometry ── */
function GeoDecor() {
  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none hidden xl:block" style={{ opacity: 0.12 }}>
      <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
        <g style={{ animation: 'rotate-slow 30s linear infinite', transformOrigin: '160px 160px' }}>
          <polygon points="160,20 300,240 20,240" stroke="rgba(255,77,0,0.8)" strokeWidth="1" fill="none" />
          <polygon points="160,60 270,220 50,220" stroke="rgba(79,142,247,0.5)" strokeWidth="1" fill="none" />
          <polygon points="160,100 240,200 80,200" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
        </g>
        <g style={{ animation: 'rotate-slow 20s linear infinite reverse', transformOrigin: '160px 160px' }}>
          <rect x="80" y="80" width="160" height="160" stroke="rgba(192,132,252,0.3)" strokeWidth="1" fill="none"
            transform="rotate(45 160 160)" />
          <rect x="100" y="100" width="120" height="120" stroke="rgba(255,77,0,0.2)" strokeWidth="1" fill="none"
            transform="rotate(45 160 160)" />
        </g>
        <circle cx="160" cy="160" r="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" strokeDasharray="4 8" />
        <circle cx="160" cy="160" r="80" stroke="rgba(255,77,0,0.15)" strokeWidth="1" fill="none" strokeDasharray="2 6" />
      </svg>
    </div>
  );
}

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState([]);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    getPosts({ limit: 3, page: 1 })
      .then(res => setLatestPosts(res.data.data?.posts || []))
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-[95vh] flex flex-col justify-center overflow-hidden mesh-bg grid-overlay">
        <Particles />
        <ScanLine />
        <GeoDecor />

        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full animate-pulse-glow"
            style={{ background: 'radial-gradient(circle, rgba(255,77,0,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'pulse-glow 5s 2s ease-in-out infinite' }} />
        </div>

        {/* Corner marks */}
        <div className="absolute top-6 left-6 w-10 h-10 border-l-2 border-t-2 border-[var(--accent)] opacity-50 animate-fade-in delay-700" />
        <div className="absolute top-6 right-6 w-10 h-10 border-r-2 border-t-2 opacity-30 animate-fade-in delay-800" style={{ borderColor: 'var(--border-strong)' }} />
        <div className="absolute bottom-6 left-6 w-10 h-10 border-l-2 border-b-2 opacity-20 animate-fade-in delay-800" style={{ borderColor: 'var(--border-strong)' }} />
        <div className="absolute bottom-6 right-6 w-10 h-10 border-r-2 border-b-2 border-[var(--accent)] opacity-30 animate-fade-in delay-700" />

        {/* Status badge */}
        <div className={`absolute top-8 left-1/2 -translate-x-1/2 transition-all duration-700 w-max max-w-[calc(100vw-32px)] ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
          style={{ transitionDelay: '0.1s' }}>
          <div className="glass flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 rounded-full">
            <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-[var(--accent)] animate-pulse-dot" />
            <span className="font-mono text-[10px] sm:text-[11px] tracking-widest uppercase whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
              3D-печать · Москва
            </span>
            <span className="hidden sm:inline font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>2019–{new Date().getFullYear()}</span>
          </div>
        </div>

        {/* Main copy */}
        <div className="container mx-auto px-6 pt-24 pb-16 relative z-10">
          <div className="max-w-4xl">

            {/* Eyebrow */}
            <div className={`flex items-center gap-4 mb-8 transition-all duration-800 ${heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
              style={{ transitionDelay: '0.2s', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s' }}>
              <span className="h-px w-16" style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
              <span className="font-mono text-xs tracking-widest2 uppercase" style={{ color: 'var(--accent)' }}>3D Print Lab</span>
            </div>

            {/* Headline */}
            <h1
              className={`font-display tracking-widest mb-10 transition-all ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ fontSize: 'clamp(52px, 10vw, 120px)', lineHeight: 1.05, transitionDuration: '1s', transitionDelay: '0.3s', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
            >
              <span style={{
                display: 'block',
                WebkitTextStroke: '1px rgba(240,235,227,0.7)',
                WebkitTextFillColor: 'transparent',
              }}>ТОЧНОСТЬ</span>
              <span className="shimmer-text" style={{ display: 'block' }}>В КАЖДОМ</span>
              <span style={{
                display: 'block',
                WebkitTextStroke: '1px rgba(255,77,0,0.5)',
                WebkitTextFillColor: 'transparent',
              }}>ИЗДЕЛИИ</span>
            </h1>

            {/* Sub + CTA */}
            <div className={`flex flex-col lg:flex-row items-start lg:items-end gap-8 transition-all ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDuration: '0.9s', transitionDelay: '0.5s', transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}>

              <p className="text-lg leading-relaxed max-w-sm font-light" style={{ color: 'var(--text-secondary)' }}>
                Загрузите STL-файл — получите готовое изделие.<br />
                Быстро, точно, по честной цене.
              </p>

              <div className="flex flex-wrap items-center gap-4 lg:ml-auto">
                <Link to="/upload"
                  className="btn-primary group flex items-center gap-3 px-8 py-4 font-sans font-semibold"
                  style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                  <Upload className="w-4 h-4" />
                  Загрузить модель
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link to="/calculator"
                  className="btn-ghost group flex items-center gap-2 px-6 py-4 font-sans font-medium border"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}>
                  <Calculator className="w-4 h-4" />
                  Цены
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className={`absolute bottom-8 left-6 flex items-center gap-3 transition-all duration-1000 delay-700 ${heroVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex flex-col gap-1.5">
              {[0.3, 0.6, 1].map((o, i) => (
                <div key={i} className="w-px h-4 rounded-full" style={{ background: `rgba(255,255,255,${o})`, animation: `pulse-dot ${1.5 + i * 0.3}s ${i * 0.2}s ease-in-out infinite` }} />
              ))}
            </div>
            <span className="font-mono text-[10px] tracking-widest3 uppercase" style={{ color: 'var(--text-muted)', writingMode: 'vertical-rl' }}>scroll</span>
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <StatsSection />

      {/* ══════════ HOW IT WORKS ══════════ */}
      <HowSection />

      {/* ══════════ FEATURES ══════════ */}
      <FeaturesSection />

      {/* ══════════ MATERIALS ══════════ */}
      <MaterialsSection />

      {/* ══════════ POSTS ══════════ */}
      {latestPosts.length > 0 && <PostsSection posts={latestPosts} />}

      {/* ══════════ REVIEWS ══════════ */}
      <ReviewsSection />

      {/* ══════════ CTA ══════════ */}
      <CTASection />
    </div>
  );
}

/* ─────────────────────────────────────────── */

function StatsSection() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="stats-cell px-8 py-10 text-center transition-all duration-700 relative group"
              style={{
                borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 120}ms`,
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(255,77,0,0.04) 0%, transparent 70%)' }} />
              <p className="font-display text-5xl md:text-6xl mb-2 leading-none" style={{ color: 'var(--accent)' }}>
                <Counter target={s.value} suffix={s.suffix} active={visible} />
              </p>
              <p className="font-sans text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{s.label}</p>
              <p className="font-mono text-xs tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowSection() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="py-28 container mx-auto px-6">
      <SectionHeader label="Процесс" title="КАК ЭТО РАБОТАЕТ" visible={visible} />

      <div className="grid md:grid-cols-3 gap-5 mt-14">
        {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }, i) => (
          <div
            key={step}
            className="glass glass-hover grad-border p-8 relative group transition-all duration-700"
            style={{
              transitionDelay: `${i * 120}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(32px)',
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <span className="font-mono text-xs tracking-widest2" style={{ color: 'var(--text-muted)' }}>{step}</span>
              <div
                className="w-10 h-10 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-muted)',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 16px var(--accent-glow)'; }}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <h3 className="font-sans text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>

            {/* Animated accent line */}
            <div className="mt-6 h-px w-0 group-hover:w-full transition-all duration-500 ease-out"
              style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-end">
        <Link to="/upload" className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase transition-colors duration-200 group"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          Попробовать сейчас
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      <div className="container mx-auto px-6 py-24">
        <SectionHeader label="Преимущества" title="ПОЧЕМУ МЫ" visible={visible} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
          {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
            <div
              key={title}
              className="glass glass-hover grad-border p-6 text-center group transition-all duration-700"
              style={{
                transitionDelay: `${i * 100}ms`,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
              }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  borderRadius: '2px',
                }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="font-sans font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              <p className="font-sans text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MaterialsSection() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="py-28 container mx-auto px-6">
      <SectionHeader label="Материалы" title="ДОСТУПНЫЕ МАТЕРИАЛЫ" visible={visible} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-14">
        {MATERIALS.map((m, i) => (
          <Link
            key={m.name}
            to="/materials"
            className="glass glass-hover grad-border group p-8 flex flex-col justify-between min-h-[180px] transition-all duration-700"
            style={{
              transitionDelay: `${i * 90}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${m.glow}`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--glass-shadow)'}
          >
            <div>
              <div className="w-4 h-4 rounded-full mb-5 transition-all duration-300 group-hover:scale-150"
                style={{ background: m.color, boxShadow: `0 0 20px ${m.glow}` }} />
              <p className="font-display text-4xl tracking-wider mb-1" style={{ color: 'var(--text-primary)' }}>{m.name}</p>
              <p className="font-sans text-xs" style={{ color: 'var(--text-secondary)' }}>{m.desc}</p>
            </div>
            <div className="flex items-center justify-between mt-5">
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{m.temp}</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                style={{ color: 'var(--text-muted)' }} />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Link to="/materials" className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase transition-colors duration-200 group"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          Сравнить все материалы
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  );
}

function PostsSection({ posts }) {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      <div className="container mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-14">
          <SectionHeader label="Галерея" title="ПОСЛЕДНИЕ РАБОТЫ" visible={visible} inline />
          <Link to="/posts" className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase transition-colors duration-200 group shrink-0"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            Все работы
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
        <div className={`grid md:grid-cols-3 gap-5 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="py-28 container mx-auto px-6">
      <SectionHeader label="Клиенты" title="ЧТО ГОВОРЯТ" visible={visible} />

      <div className="grid md:grid-cols-3 gap-5 mt-14">
        {REVIEWS.map((r, i) => (
          <div
            key={r.name}
            className="glass p-8 relative group transition-all duration-700"
            style={{
              transitionDelay: `${i * 120}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(32px)',
            }}
          >
            {/* Quote mark */}
            <div className="absolute top-6 right-6 font-display text-7xl leading-none pointer-events-none select-none"
              style={{ color: 'var(--accent)', opacity: 0.1 }}>"</div>

            {/* Stars */}
            <div className="flex gap-1 mb-5">
              {Array.from({ length: r.rating }).map((_, j) => (
                <div key={j} className="w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover:scale-125"
                  style={{ background: 'var(--accent)', transitionDelay: `${j * 50}ms`, boxShadow: '0 0 6px var(--accent-glow)' }} />
              ))}
            </div>

            <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              {r.text}
            </p>

            <div className="flex items-center justify-between pt-5" style={{ borderTop: '1px solid var(--border)' }}>
              <div>
                <p className="font-sans font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
                <p className="font-mono text-xs tracking-wider uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.role}</p>
              </div>
              <div className="w-7 h-7 flex items-center justify-center font-mono text-xs font-bold"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                {r.name[0]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} className="relative py-36 overflow-hidden mesh-bg grid-overlay">
      <Particles />

      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,77,0,0.1) 0%, transparent 70%)' }} />

      {/* Corners */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-[var(--accent)] opacity-50" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-[var(--accent)] opacity-50" />
      <div className="absolute top-8 right-8 w-8 h-8 border-r border-t opacity-20" style={{ borderColor: 'var(--border-strong)' }} />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-l border-b opacity-20" style={{ borderColor: 'var(--border-strong)' }} />

      <div className="container mx-auto px-6 text-center relative z-10">
        <span
          className="font-mono text-xs tracking-widest2 uppercase block mb-6 transition-all duration-700"
          style={{ color: 'var(--accent)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transitionDelay: '0.1s' }}
        >
          Начать сейчас
        </span>

        <h2
          className="font-display tracking-wider mb-8 leading-[0.92] transition-all duration-1000"
          style={{
            fontSize: 'clamp(48px, 9vw, 110px)',
            color: 'var(--text-primary)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transitionDelay: '0.2s',
          }}
        >
          ГОТОВЫ НАПЕЧАТАТЬ<br />
          <span className="shimmer-text">ЧТО-ТО КРУТОЕ?</span>
        </h2>

        <p
          className="font-sans mb-12 max-w-md mx-auto transition-all duration-700"
          style={{
            color: 'var(--text-secondary)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transitionDelay: '0.3s',
          }}
        >
          Загрузите STL-файл, получите цену за 10 секунд и оформите заказ онлайн
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transitionDelay: '0.4s',
          }}
        >
          <Link to="/upload"
            className="btn-primary group inline-flex items-center gap-3 px-10 py-5 font-sans font-semibold"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
            <Upload className="w-4 h-4" />
            Загрузить модель
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
          <Link to="/contact"
            className="btn-ghost inline-flex items-center gap-3 px-8 py-5 font-sans font-medium border"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}>
            Связаться с нами
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Reusable section header ─── */
function SectionHeader({ label, title, visible, inline = false }) {
  if (inline) {
    return (
      <div className="flex items-baseline gap-5">
        <span className="font-mono text-xs tracking-widest2 uppercase shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <h2 className="font-display text-4xl md:text-5xl tracking-wider" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      </div>
    );
  }
  return (
    <div className={`flex items-baseline gap-5 transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
      <span className="font-mono text-xs tracking-widest2 uppercase shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <h2 className="font-display text-4xl md:text-5xl tracking-wider" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      <span className="h-px flex-1 hidden md:block" style={{ background: 'linear-gradient(90deg, var(--border-strong), transparent)' }} />
    </div>
  );
}
