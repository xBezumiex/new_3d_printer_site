import { BrowserRouter, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useRef, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ModelProvider } from './context/ModelContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AppRoutes from './routes';

/* ── Scroll progress bar ─────────────────────────── */
function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (scrolled / total) * 100 : 0;
      if (barRef.current) barRef.current.style.width = `${pct}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div id="scroll-progress" ref={barRef} style={{ width: '0%' }} />;
}

/* ── Intro loader ────────────────────────────────── */
function IntroLoader({ onDone }) {
  const [phase, setPhase] = useState(0); // 0=visible 1=exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1600);
    const t2 = setTimeout(() => onDone(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#0a0a0f',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.55s ease, transform 0.55s cubic-bezier(.22,1,.36,1)',
        opacity: phase === 1 ? 0 : 1,
        transform: phase === 1 ? 'translateY(-12px)' : 'translateY(0)',
        pointerEvents: phase === 1 ? 'none' : 'all',
      }}
    >
      {/* Logo mark */}
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: 'linear-gradient(135deg,#f97316,#fb923c)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 40px rgba(249,115,22,0.45)',
        marginBottom: 24,
        animation: 'pulseGlow 2s ease-in-out infinite',
      }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="white" strokeWidth="2" fill="none"/>
          <path d="M16 4V16M16 16V28M16 16L28 10M16 16L4 10" stroke="white" strokeWidth="1.5" opacity="0.5"/>
        </svg>
      </div>
      {/* Title */}
      <div style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: 42, letterSpacing: '0.15em',
        color: '#f0eee8',
        lineHeight: 1,
        animation: 'fadeUp 0.6s 0.2s both',
      }}>
        3D PRINT LAB
      </div>
      {/* Tagline */}
      <div style={{
        fontFamily: 'DM Mono, monospace',
        fontSize: 11, letterSpacing: '0.3em',
        color: '#f97316', marginTop: 10,
        textTransform: 'uppercase',
        animation: 'fadeUp 0.6s 0.4s both',
      }}>
        ЗАГРУЗКА СИСТЕМЫ
      </div>
      {/* Progress bar */}
      <div style={{
        marginTop: 32, width: 160, height: 2,
        background: 'rgba(255,255,255,0.08)', borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg,#f97316,#fb923c)',
          borderRadius: 2,
          animation: 'introBar 1.4s 0.3s cubic-bezier(.22,1,.36,1) both',
        }} />
      </div>
      <style>{`
        @keyframes introBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}

/* ── Route transition wrapper ────────────────────── */
function RouteWrapper({ children }) {
  const location = useLocation();
  const [key, setKey] = useState(location.pathname);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      setKey(location.pathname);
      setVisible(true);
    }, 80);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div
      key={key}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(.22,1,.36,1)',
      }}
    >
      {children}
    </div>
  );
}

/* ── App shell ───────────────────────────────────── */
function AppShell() {
  const [introShown, setIntroShown] = useState(
    () => !sessionStorage.getItem('intro_seen')
  );

  const handleIntroDone = () => {
    sessionStorage.setItem('intro_seen', '1');
    setIntroShown(false);
  };

  return (
    <>
      <ScrollProgress />
      {introShown && <IntroLoader onDone={handleIntroDone} />}
      <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
        <Header />
        <main className="flex-grow">
          <RouteWrapper>
            <AppRoutes />
          </RouteWrapper>
        </main>
        <Footer />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'DM Sans, sans-serif',
          },
          success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ModelProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AppShell />
          </BrowserRouter>
        </ModelProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
