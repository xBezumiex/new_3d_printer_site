import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, X, RefreshCw } from 'lucide-react';
import { getPaymentStatus } from '../api/payments.api';

export default function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();

  const orderId   = params.get('orderId');
  const paymentId = sessionStorage.getItem(`payment_${orderId}`);

  const [status, setStatus] = useState('checking'); // checking | success | fail

  useEffect(() => {
    if (!paymentId) { setStatus('fail'); return; }

    let attempts = 0;
    const check = async () => {
      try {
        const res = await getPaymentStatus(paymentId);
        const { paid, status: s } = res.data;
        if (paid || s === 'succeeded') {
          setStatus('success');
          setTimeout(() => navigate(`/orders/${orderId}`), 2500);
        } else if (s === 'canceled') {
          setStatus('fail');
        } else {
          // pending / waiting_for_capture — повторяем
          attempts++;
          if (attempts < 6) setTimeout(check, 1500);
          else setStatus('fail');
        }
      } catch {
        setStatus('fail');
      }
    };
    check();
  }, [paymentId, orderId, navigate]);

  return (
    <div style={{
      minHeight:'100vh', background:'var(--bg)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:24,
    }}>
      <div className="glass" style={{
        borderRadius:24, padding:'clamp(32px,6vw,56px)',
        maxWidth:400, width:'100%', textAlign:'center',
        border:'1px solid var(--glass-border)',
      }}>
        {status === 'checking' && (
          <>
            <div style={{
              width:72, height:72, margin:'0 auto 24px', borderRadius:'50%',
              border:'2px solid var(--accent)', display:'flex', alignItems:'center', justifyContent:'center',
              position:'relative',
            }}>
              <div style={{
                position:'absolute', inset:-4, borderRadius:'50%',
                border:'2px solid transparent', borderTopColor:'var(--accent)',
                animation:'spin 0.9s linear infinite',
              }}/>
              <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
                <path d="M14 4v10l5 3" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round"/>
                <circle cx={14} cy={14} r={11} stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="4 4"/>
              </svg>
            </div>
            <div className="font-display tracking-widest text-xl mb-2" style={{color:'var(--text-primary)'}}>
              ПРОВЕРКА ОПЛАТЫ
            </div>
            <div className="font-mono text-xs" style={{color:'var(--text-muted)'}}>
              Ожидаем подтверждения от банка...
            </div>
          </>
        )}

        {status === 'success' && (
          <div style={{animation:'payment-fadein 0.5s ease'}}>
            <div style={{
              width:80, height:80, margin:'0 auto 24px', borderRadius:'50%',
              background:'rgba(74,222,128,0.12)', border:'2px solid rgba(74,222,128,0.4)',
              display:'flex', alignItems:'center', justifyContent:'center',
              animation:'payment-success-pop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              <svg width={36} height={36} viewBox="0 0 36 36" fill="none">
                <polyline
                  points="7,18 15,26 29,10"
                  stroke="#4ADE80" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                  style={{strokeDasharray:40, animation:'payment-checkmark 0.5s 0.2s ease both'}}
                />
              </svg>
            </div>
            <div className="font-display tracking-widest text-2xl mb-3" style={{color:'var(--text-primary)'}}>
              ОПЛАТА ПРОШЛА
            </div>
            <div className="font-sans text-sm mb-1" style={{color:'var(--text-secondary)'}}>
              Заказ успешно оплачен и подтверждён
            </div>
            <div className="font-mono text-xs mb-5" style={{color:'var(--text-muted)'}}>
              Переход к заказу...
            </div>
            <div style={{display:'flex', justifyContent:'center'}}>
              <div className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{borderColor:'var(--border-strong)', borderTopColor:'var(--accent)'}}/>
            </div>
          </div>
        )}

        {status === 'fail' && (
          <div style={{animation:'payment-fadein 0.5s ease'}}>
            <div style={{
              width:80, height:80, margin:'0 auto 24px', borderRadius:'50%',
              background:'rgba(248,113,113,0.1)', border:'2px solid rgba(248,113,113,0.35)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <X size={36} color="#f87171"/>
            </div>
            <div className="font-display tracking-widest text-2xl mb-3" style={{color:'var(--text-primary)'}}>
              ПЛАТЁЖ ОТМЕНЁН
            </div>
            <div className="font-sans text-sm mb-6" style={{color:'var(--text-secondary)'}}>
              Платёж не был завершён. Попробуйте ещё раз.
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              <button
                onClick={() => navigate(`/payment/${orderId}`)}
                style={{
                  padding:'12px 24px', background:'var(--accent)', color:'#fff',
                  border:'none', borderRadius:10, cursor:'pointer',
                  fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14,
                  boxShadow:'0 4px 24px var(--accent-glow)',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}
              >
                <RefreshCw size={15}/> Попробовать снова
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  padding:'10px 24px', background:'none', color:'var(--text-muted)',
                  border:'1px solid var(--border-strong)', borderRadius:10, cursor:'pointer',
                  fontFamily:'DM Sans,sans-serif', fontSize:13,
                }}
              >
                В личный кабинет
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
