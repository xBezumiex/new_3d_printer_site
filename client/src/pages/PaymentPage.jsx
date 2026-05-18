import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Shield, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import * as ordersApi from '../api/orders.api';
import * as paymentsApi from '../api/payments.api';

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate    = useNavigate();

  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!orderId) { navigate('/dashboard'); return; }
    ordersApi.getOrderById(orderId)
      .then(data => setOrder(data.data?.order || data.order || data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  const handlePay = async () => {
    setProcessing(true);
    try {
      const res = await paymentsApi.createPayment({ orderId, method: 'card' });
      const { confirmationUrl, paymentId } = res.data;
      sessionStorage.setItem(`payment_${orderId}`, paymentId);
      window.location.href = confirmationUrl;
    } catch (err) {
      toast.error(err.message || 'Ошибка создания платежа');
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
        <p className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Загрузка...</p>
      </div>
    </div>
  );

  const price     = order?.price ?? 0;
  const orderNum  = order?.orderNumber ?? '—';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px,4vw,40px)' }}>
      <div style={{ maxWidth: 440, width: '100%' }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none',
          border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
          fontFamily: 'DM Sans,sans-serif', fontSize: 13, marginBottom: 28, padding: 0,
        }}>
          <ArrowLeft size={16} /> Назад
        </button>

        {/* Label */}
        <div className="font-mono text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--accent)' }}>/ оплата</div>
        <h1 className="font-display tracking-widest text-3xl mb-8" style={{ color: 'var(--text-primary)' }}>ОПЛАТА ЗАКАЗА</h1>

        <div className="glass" style={{ borderRadius: 20, padding: 'clamp(24px,5vw,36px)' }}>

          {/* Order summary */}
          <div style={{ marginBottom: 28, padding: '16px 20px', background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', borderRadius: 12 }}>
            <div className="font-mono text-xs tracking-wider uppercase mb-3" style={{ color: 'var(--text-muted)' }}>/ детали заказа</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Номер заказа', `#${orderNum}`],
                order?.material && ['Материал', order.material],
                order?.quality  && ['Качество',  order.quality],
                order?.quantity && ['Количество', `${order.quantity} шт.`],
              ].filter(Boolean).map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span className="font-sans text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Итого</span>
              <span className="font-display tracking-widest text-2xl" style={{ color: 'var(--accent)' }}>{price} ₽</span>
            </div>
          </div>

          {/* YooKassa branding */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24, padding: '12px 16px', background: 'rgba(255,77,0,0.06)', border: '1px solid rgba(255,77,0,0.15)', borderRadius: 10 }}>
            <Shield size={15} color="#4ADE80" />
            <span className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
              Оплата через <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>ЮКасса</span> — карты, СБП, кошельки
            </span>
          </div>

          {/* Pay button */}
          <button onClick={handlePay} disabled={processing} style={{
            width: '100%', padding: '16px 0',
            background: processing ? 'var(--bg-raised)' : 'linear-gradient(135deg,var(--accent),#fb923c)',
            color: processing ? 'var(--text-muted)' : '#fff',
            border: 'none', borderRadius: 12,
            cursor: processing ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 15,
            boxShadow: processing ? 'none' : '0 4px 24px var(--accent-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}>
            {processing ? (
              <><div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'var(--text-muted)' }} /> Переход к оплате...</>
            ) : (
              <><Lock size={15} /> Оплатить {price} ₽ <ChevronRight size={16} /></>
            )}
          </button>

          {/* Security note */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 }}>
            <Lock size={11} color="var(--text-muted)" />
            <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Данные защищены · 256-bit SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
