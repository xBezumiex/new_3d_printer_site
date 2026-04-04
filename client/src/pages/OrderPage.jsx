import OrderForm from '../components/order/OrderForm';

export default function OrderPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '32px 0 24px' }}>
        <div className="container mx-auto px-6">
          <p className="font-mono text-xs tracking-widest2 uppercase mb-3" style={{ color: 'var(--accent)' }}>/ заказ</p>
          <h1 className="font-display tracking-widest" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            ОФОРМИТЬ ЗАКАЗ
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="glass p-8">
          <OrderForm />
        </div>
      </div>
    </div>
  );
}
