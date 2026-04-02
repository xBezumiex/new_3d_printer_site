import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Calculator, Package, Star, ArrowRight, Printer, Zap, Shield, HeartHandshake } from 'lucide-react';
import { getPosts } from '../api/posts.api';
import PostCard from '../components/posts/PostCard';

/* ─── Typewriter hook ────────────────────────────── */
function useTypewriter(text, speed = 45, delay = 0) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        setDisplayed(text.slice(0, ++i));
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, speed);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [text, speed, delay]);
  return { displayed, done };
}

/* ─── IntersectionObserver hook ─────────────────── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.15, ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/* ─── Animated counter ───────────────────────────── */
function Counter({ target, suffix = '', duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(target);
    if (!num) return;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(num * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Particles ─────────────────────────────────── */
const PARTICLE_COLORS = ['rgba(249,115,22,0.55)', 'rgba(59,130,246,0.45)', 'rgba(139,92,246,0.40)'];
function Particles({ count = 24 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      duration: 5 + Math.random() * 8,
      delay: Math.random() * 6,
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: p.color,
            animation: `float ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Scan line ─────────────────────────────────── */
function ScanLine() {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, height: 2,
      background: 'linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.6) 30%, rgba(249,115,22,0.8) 50%, rgba(249,115,22,0.6) 70%, transparent 100%)',
      animation: 'scan 5s linear infinite',
      pointerEvents: 'none', zIndex: 3,
    }} />
  );
}

/* ─── Rotating SVG geometry ─────────────────────── */
function GeoDecor() {
  return (
    <div style={{
      position: 'absolute', right: '6%', top: '50%', transform: 'translateY(-50%)',
      pointerEvents: 'none', zIndex: 2, opacity: 0.35,
    }}>
      <svg width="260" height="260" viewBox="0 0 260 260" fill="none" style={{ animation: 'rotateSlow 25s linear infinite' }}>
        <polygon points="130,20 240,200 20,200" stroke="rgba(249,115,22,0.7)" strokeWidth="1.5" fill="none"/>
        <polygon points="130,50 210,180 50,180" stroke="rgba(59,130,246,0.5)" strokeWidth="1" fill="none"/>
        <rect x="90" y="90" width="80" height="80" transform="rotate(45 130 130)" stroke="rgba(139,92,246,0.5)" strokeWidth="1" fill="none"/>
        <circle cx="130" cy="130" r="50" stroke="rgba(249,115,22,0.25)" strokeWidth="0.5" fill="none" strokeDasharray="4 6"/>
        <circle cx="130" cy="130" r="80" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" fill="none" strokeDasharray="2 8"/>
      </svg>
    </div>
  );
}

/* ─── Corner markers ────────────────────────────── */
function CornerMarkers() {
  const corners = [
    { top: 16, left: 16 },
    { top: 16, right: 16 },
    { bottom: 16, left: 16 },
    { bottom: 16, right: 16 },
  ];
  return (
    <>
      {corners.map((style, i) => (
        <div key={i} style={{ position: 'absolute', ...style, width: 16, height: 16, pointerEvents: 'none', zIndex: 4 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d={
              i === 0 ? 'M0 8V0H8' :
              i === 1 ? 'M16 8V0H8' :
              i === 2 ? 'M0 8V16H8' : 'M16 8V16H8'
            } stroke="rgba(249,115,22,0.5)" strokeWidth="1.5"/>
          </svg>
        </div>
      ))}
    </>
  );
}

/* ─── Magnetic button ────────────────────────────── */
function MagneticBtn({ children, to, className: cls, style: sx }) {
  const ref = useRef(null);
  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.22;
    const dy = (e.clientY - cy) * 0.22;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  }, []);
  const onMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)';
  }, []);
  return (
    <Link
      to={to}
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cls}
      style={{ ...sx, transition: 'transform 0.3s cubic-bezier(.22,1,.36,1)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      {children}
    </Link>
  );
}

/* ─── Section header ─────────────────────────────── */
function SectionHeader({ label, title, sub }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ textAlign: 'center', marginBottom: 56, opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(24px)', transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(.22,1,.36,1)' }}>
      <div className="section-label" style={{ marginBottom: 12 }}>{label}</div>
      <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '0.06em', color: 'var(--text-1)', lineHeight: 1 }}>{title}</h2>
      {sub && <p style={{ marginTop: 12, fontSize: 15, color: 'var(--text-2)', maxWidth: 480, margin: '12px auto 0' }}>{sub}</p>}
    </div>
  );
}

/* ─── Data ───────────────────────────────────────── */
const STATS = [
  { value: 500, suffix: '+', label: 'Выполненных заказов' },
  { value: 5,   suffix: '',  label: 'Лет опыта' },
  { value: 12,  suffix: '',  label: 'Принтеров' },
  { value: 98,  suffix: '%', label: 'Довольных клиентов' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: Upload,     title: 'Загрузите модель',      desc: 'STL, OBJ или 3MF — прямо на сайте без лишних шагов' },
  { step: '02', icon: Calculator, title: 'Рассчитайте стоимость', desc: 'Выберите материал и качество — цена считается мгновенно' },
  { step: '03', icon: Package,    title: 'Получите заказ',        desc: 'Оформите онлайн и отслеживайте статус в личном кабинете' },
];

const MATERIALS = [
  { name: 'PLA',   desc: 'Лёгкий в печати',       glow: 'rgba(52,211,153,0.35)', dot: '#34d399' },
  { name: 'ABS',   desc: 'Прочный, термостойкий',  glow: 'rgba(249,115,22,0.35)', dot: '#f97316' },
  { name: 'PETG',  desc: 'Универсальный',           glow: 'rgba(59,130,246,0.35)', dot: '#3b82f6' },
  { name: 'TPU',   desc: 'Гибкий',                 glow: 'rgba(139,92,246,0.35)', dot: '#8b5cf6' },
  { name: 'Nylon', desc: 'Макс. прочность',         glow: 'rgba(156,163,175,0.25)', dot: '#9ca3af' },
];

const REVIEWS = [
  { name: 'Дмитрий К.', rating: 5, text: 'Отличное качество! Заказал прототип корпуса — всё точь-в-точь. Буду обращаться ещё.', init: 'Д' },
  { name: 'Анна М.',    rating: 5, text: 'Быстро, качественно, удобный сайт. Особенно понравился калькулятор — всё прозрачно.', init: 'А' },
  { name: 'Сергей П.',  rating: 5, text: 'Напечатали запчасть для старого принтера, которую нигде не купить. Профессионалы!', init: 'С' },
];

const FEATURES = [
  { icon: Zap,            title: 'Быстро',       desc: 'Стандартные заказы 24–48 ч',           color: '#f59e0b' },
  { icon: Shield,         title: 'Надёжно',      desc: 'Контроль качества каждого изделия',    color: '#3b82f6' },
  { icon: Printer,        title: '12 принтеров', desc: 'Широкий выбор материалов и технологий', color: '#8b5cf6' },
  { icon: HeartHandshake, title: 'Поддержка',    desc: 'Консультируем на каждом этапе',         color: '#34d399' },
];

/* ─── HomePage ───────────────────────────────────── */
export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const heroRef = useRef(null);

  const { displayed: typeText } = useTypewriter(
    'Загрузите модель — получите готовое изделие. Быстро, точно, по честной цене.',
    28, 900
  );

  useEffect(() => {
    getPosts({ limit: 3, page: 1 })
      .then(res => setLatestPosts(res.data.data?.posts || []))
      .catch(() => {});
  }, []);

  // Parallax on hero
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e) => {
      const rect = hero.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    hero.addEventListener('mousemove', onMove);
    return () => hero.removeEventListener('mousemove', onMove);
  }, []);

  const parallaxX = (mousePos.x - 0.5) * 30;
  const parallaxY = (mousePos.y - 0.5) * 20;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── HERO ─────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="mesh-bg grid-overlay"
        style={{ position: 'relative', overflow: 'hidden', minHeight: '92vh', display: 'flex', alignItems: 'center' }}
      >
        <Particles count={24} />
        <ScanLine />
        <CornerMarkers />
        <GeoDecor />

        {/* Ambient glows */}
        <div style={{
          position: 'absolute', top: '20%', left: '15%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 60%)',
          transform: `translate(${parallaxX * 0.4}px, ${parallaxY * 0.4}px)`,
          transition: 'transform 0.6s ease', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '20%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)',
          transform: `translate(${-parallaxX * 0.3}px, ${-parallaxY * 0.3}px)`,
          transition: 'transform 0.6s ease', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 5, maxWidth: 1280, margin: '0 auto', padding: '100px 24px 80px', width: '100%' }}>

          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-2)',
            borderRadius: 100,
            backdropFilter: 'blur(16px)',
            marginBottom: 36,
            animation: 'fadeUp 0.6s 0.1s both',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'block', animation: 'pulseDot 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-2)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Работаем в Москве · Быстрая доставка
            </span>
          </div>

          {/* Big title — 3 lines */}
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', lineHeight: 0.9, marginBottom: 28 }}>
            <div style={{ fontSize: 'clamp(72px,12vw,160px)', color: 'var(--text-1)', letterSpacing: '0.04em', animation: 'fadeUp 0.65s 0.25s both' }}>
              3D PRINT
            </div>
            <div style={{ fontSize: 'clamp(72px,12vw,160px)', letterSpacing: '0.04em', animation: 'fadeUp 0.65s 0.4s both' }}
              className="shimmer-text">
              ЛЮБОЙ
            </div>
            <div style={{ fontSize: 'clamp(72px,12vw,160px)', letterSpacing: '0.04em', animation: 'fadeUp 0.65s 0.55s both' }}
              className="text-outline">
              СЛОЖНОСТИ
            </div>
          </h1>

          {/* Typewriter */}
          <p style={{
            fontSize: 'clamp(14px,1.6vw,18px)',
            color: 'var(--text-2)',
            maxWidth: 540,
            lineHeight: 1.7,
            marginBottom: 40,
            minHeight: '3.4em',
            animation: 'fadeIn 0.5s 0.7s both',
          }}>
            {typeText}
            <span style={{ borderRight: '2px solid var(--accent)', marginLeft: 2, animation: 'pulseDot 0.8s ease-in-out infinite' }}>&nbsp;</span>
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeUp 0.65s 0.9s both' }}>
            <MagneticBtn to="/upload" style={{
              padding: '14px 28px', background: 'var(--accent)',
              color: '#fff', fontWeight: 600, fontSize: 15,
              borderRadius: 12,
              boxShadow: '0 4px 24px var(--accent-glow)',
            }}>
              <Upload size={17} /> Загрузить модель
            </MagneticBtn>
            <MagneticBtn to="/calculator" style={{
              padding: '14px 28px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-2)',
              backdropFilter: 'blur(12px)',
              color: 'var(--text-1)', fontWeight: 600, fontSize: 15,
              borderRadius: 12,
            }}>
              <Calculator size={17} /> Рассчитать цену
            </MagneticBtn>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.4, animation: 'fadeIn 1s 1.5s both' }}>
            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Scroll</span>
            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, var(--accent), transparent)', animation: 'float 2s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
          {STATS.map((s, i) => {
            const [ref, inView] = useInView();
            return (
              <div key={s.label} ref={ref} style={{
                textAlign: 'center',
                opacity: inView ? 1 : 0,
                transform: inView ? 'none' : 'translateY(20px)',
                transition: `opacity 0.5s ${i * 0.1}s ease, transform 0.5s ${i * 0.1}s cubic-bezier(.22,1,.36,1)`,
              }}>
                <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 52, letterSpacing: '0.04em', color: 'var(--accent)', lineHeight: 1 }}>
                  {inView ? <Counter target={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
                </p>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 6 }}>{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section style={{ padding: '96px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeader label="/ процесс" title="КАК ЭТО РАБОТАЕТ" sub="Три простых шага от идеи до готового изделия" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }, i) => {
            const [ref, inView] = useInView();
            return (
              <div
                key={step} ref={ref}
                className="glass glass-hover grad-border card-line"
                style={{
                  borderRadius: 20, padding: 32, position: 'relative', overflow: 'hidden',
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'none' : 'translateY(28px)',
                  transition: `opacity 0.6s ${i * 0.12}s ease, transform 0.6s ${i * 0.12}s cubic-bezier(.22,1,.36,1)`,
                }}
              >
                {/* Step number watermark */}
                <span style={{
                  position: 'absolute', top: 16, right: 20,
                  fontFamily: 'Bebas Neue, sans-serif', fontSize: 72, lineHeight: 1,
                  color: 'rgba(249,115,22,0.06)', letterSpacing: '0.05em',
                  pointerEvents: 'none', userSelect: 'none',
                }}>
                  {step}
                </span>
                <div style={{
                  width: 52, height: 52,
                  background: 'linear-gradient(135deg, var(--accent), #fb923c)',
                  borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, boxShadow: '0 4px 20px var(--accent-glow)',
                }}>
                  <Icon size={24} color="#fff" />
                </div>
                <h3 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, letterSpacing: '0.06em', color: 'var(--text-1)', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeader label="/ преимущества" title="ПОЧЕМУ МЫ" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => {
              const [ref, inView] = useInView();
              return (
                <div
                  key={title} ref={ref}
                  className="glass glass-hover card-line"
                  style={{
                    borderRadius: 16, padding: '28px 24px', textAlign: 'center',
                    opacity: inView ? 1 : 0,
                    transform: inView ? 'none' : 'translateY(24px)',
                    transition: `opacity 0.5s ${i * 0.1}s ease, transform 0.5s ${i * 0.1}s cubic-bezier(.22,1,.36,1)`,
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <Icon size={22} color={color} />
                  </div>
                  <h3 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: '0.06em', color: 'var(--text-1)', marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── MATERIALS ────────────────────────────────── */}
      <section style={{ padding: '96px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeader label="/ материалы" title="ДОСТУПНЫЕ МАТЕРИАЛЫ" sub="От простого PLA до прочного нейлона" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 32 }}>
          {MATERIALS.map((m, i) => {
            const [ref, inView] = useInView();
            return (
              <Link
                key={m.name} to="/materials" ref={ref}
                style={{
                  position: 'relative', textDecoration: 'none',
                  borderRadius: 16, padding: '28px 20px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'none' : 'translateY(24px)',
                  transition: `opacity 0.5s ${i * 0.08}s ease, transform 0.5s ${i * 0.08}s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease, border-color 0.35s ease`,
                  display: 'block',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = `0 0 40px ${m.glow}`;
                  e.currentTarget.style.borderColor = m.dot + '60';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: m.dot, marginBottom: 16,
                  boxShadow: `0 0 12px ${m.glow}`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }} />
                <p style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, letterSpacing: '0.06em', color: 'var(--text-1)', lineHeight: 1, marginBottom: 6 }}>{m.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{m.desc}</p>
              </Link>
            );
          })}
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link to="/materials" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Сравнить все материалы <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── LATEST POSTS ─────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div className="section-label" style={{ marginBottom: 10 }}>/ галерея</div>
                <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(2rem,5vw,3rem)', letterSpacing: '0.06em', color: 'var(--text-1)', lineHeight: 1 }}>ПОСЛЕДНИЕ РАБОТЫ</h2>
              </div>
              <Link to="/posts" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>
                Все работы <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
              {latestPosts.map((post, i) => (
                <div key={post.id} style={{ animation: `fadeUp 0.6s ${i * 0.1}s both` }}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── REVIEWS ──────────────────────────────────── */}
      <section style={{ padding: '96px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeader label="/ отзывы" title="ЧТО ГОВОРЯТ КЛИЕНТЫ" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {REVIEWS.map((r, i) => {
            const [ref, inView] = useInView();
            return (
              <div
                key={r.name} ref={ref}
                className="glass glass-hover grad-border"
                style={{
                  borderRadius: 20, padding: 28,
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'none' : 'translateY(24px)',
                  transition: `opacity 0.6s ${i * 0.12}s ease, transform 0.6s ${i * 0.12}s cubic-bezier(.22,1,.36,1)`,
                }}
              >
                {/* Stars */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} size={14} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                  ))}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg,var(--accent),#fb923c)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, color: '#fff',
                  }}>
                    {r.init}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{r.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="mesh-bg" style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <CornerMarkers />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div className="section-label" style={{ marginBottom: 16 }}>/ начать сейчас</div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(2.5rem,6vw,4rem)', letterSpacing: '0.06em', lineHeight: 1, marginBottom: 16 }}
            className="shimmer-text">
            ГОТОВЫ НАПЕЧАТАТЬ ЧТО-ТО КРУТОЕ?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 36, lineHeight: 1.7 }}>
            Загрузите STL-файл, получите цену за 10 секунд и оформите заказ онлайн
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <MagneticBtn to="/upload" style={{
              padding: '14px 32px', background: 'var(--accent)', color: '#fff',
              fontWeight: 700, fontSize: 15, borderRadius: 12,
              boxShadow: '0 4px 28px var(--accent-glow)',
            }}>
              <Upload size={17} /> Загрузить модель
            </MagneticBtn>
            <MagneticBtn to="/contact" style={{
              padding: '14px 28px',
              background: 'transparent',
              border: '1px solid var(--border-2)',
              color: 'var(--text-1)', fontWeight: 600, fontSize: 15, borderRadius: 12,
            }}>
              Связаться с нами
            </MagneticBtn>
          </div>
        </div>
      </section>

    </div>
  );
}
