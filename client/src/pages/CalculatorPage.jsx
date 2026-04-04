import PriceCalculator from '../components/calculator/PriceCalculator';

export default function CalculatorPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: 'clamp(32px,6vw,60px) clamp(16px,4vw,24px) 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
            / калькулятор
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(2.5rem,6vw,4.5rem)', letterSpacing: '0.05em', color: 'var(--text-1)', lineHeight: 1, marginBottom: 10 }}>
            СТОИМОСТЬ ПЕЧАТИ
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 500, lineHeight: 1.7 }}>
            Выберите материал, качество и заполнение — цена рассчитывается мгновенно.
            Загрузите 3D-модель для точного результата.
          </p>
        </div>

        <PriceCalculator />
      </div>
    </div>
  );
}
