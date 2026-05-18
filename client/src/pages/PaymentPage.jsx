import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Shield, CreditCard, Zap, Phone, Radio, Check, X, RefreshCw, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import * as ordersApi from '../api/orders.api';
import * as paymentsApi from '../api/payments.api';

// ─── Helpers ───────────────────────────────────────────────
const fmtCardNum = v => v.replace(/\D/g,'').slice(0,16).replace(/(\d{4})(?=\d)/g,'$1 ');
const fmtExpiry = v => { const d=v.replace(/\D/g,'').slice(0,4); return d.length>2 ? d.slice(0,2)+'/'+d.slice(2) : d; };
const fmtPhone = v => {
  const raw = v.replace(/\D/g,'');
  const d = raw.startsWith('7') || raw.startsWith('8') ? raw.slice(1) : raw;
  const t = d.slice(0,10);
  let r = '+7';
  if (t[0]) r += ' ('+t.slice(0,3);
  if (t.length>=3) r += ') ';
  if (t.length>3) r += t.slice(3,6);
  if (t.length>=6) r += '-';
  if (t.length>6) r += t.slice(6,8);
  if (t.length>=8) r += '-';
  if (t.length>8) r += t.slice(8,10);
  return r;
};

const cardType = num => {
  const n = num.replace(/\s/g,'');
  if (n.startsWith('2')) return 'mir';
  if (n.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(n)) return 'mc';
  return null;
};

const CARD_GRAD = {
  mir:  'linear-gradient(135deg,#0d4d24 0%,#1a6e35 45%,#2d9a5c 100%)',
  visa: 'linear-gradient(135deg,#0d1240 0%,#1a1f5e 45%,#2e3494 100%)',
  mc:   'linear-gradient(135deg,#5C0F0F 0%,#8B1A1A 45%,#CC3333 100%)',
  null: 'linear-gradient(135deg,#0d0d2a 0%,#1a1a3e 45%,#2a2a5e 100%)',
};

const BANKS_SBP = [
  { id:'sber',     name:'Сбер',       color:'#21A038', text:'#fff' },
  { id:'tinkoff',  name:'Т-Банк',     color:'#FFDD2D', text:'#000' },
  { id:'vtb',      name:'ВТБ',        color:'#009FCA', text:'#fff' },
  { id:'alfa',     name:'Альфа',      color:'#EF3124', text:'#fff' },
  { id:'gpb',      name:'Газпром',    color:'#003087', text:'#fff' },
  { id:'raif',     name:'Райфф',      color:'#FFE600', text:'#000' },
  { id:'psb',      name:'ПСБ',        color:'#FF6B00', text:'#fff' },
  { id:'ozon',     name:'Озон Банк',  color:'#005BFF', text:'#fff' },
];

const OPERATORS = [
  { id:'mts',      name:'МТС',      color:'#E30611', text:'#fff' },
  { id:'beeline',  name:'Билайн',   color:'#FFD900', text:'#000' },
  { id:'megafon',  name:'МегаФон',  color:'#00B956', text:'#fff' },
  { id:'tele2',    name:'Теле2',    color:'#1F3C88', text:'#fff' },
];

const METHODS = [
  { id:'card',     label:'Карта',    Icon: CreditCard },
  { id:'sbp',      label:'СБП',      Icon: Zap        },
  { id:'phone',    label:'Телефон',  Icon: Phone      },
  { id:'operator', label:'Оператор', Icon: Radio      },
];

const STEPS = ['Проверка данных', 'Связь с банком', 'Обработка платежа', 'Подтверждение'];

// ─── Mock QR Code ───────────────────────────────────────────
function MockQR({ size = 160 }) {
  const cells = useMemo(() => {
    const N = 25;
    const g = Array.from({length:N}, () => Array(N).fill(false));

    const finder = (r0, c0) => {
      for (let dr=0; dr<7; dr++) for (let dc=0; dc<7; dc++) {
        const border = dr===0||dr===6||dc===0||dc===6;
        const inner  = dr>=2&&dr<=4&&dc>=2&&dc<=4;
        g[r0+dr][c0+dc] = border || inner;
      }
    };
    finder(0,0); finder(0,N-7); finder(N-7,0);

    let s = 0xdeadbeef;
    const rng = () => { s^=s<<13; s^=s>>17; s^=s<<5; return s>>>0; };
    for (let r=0; r<N; r++) for (let c=0; c<N; c++) {
      if (r<8&&c<8||r<8&&c>=N-8||r>=N-8&&c<8) continue;
      g[r][c] = rng()%2===0;
    }
    return g;
  }, []);

  const N = cells.length, cs = size/N;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{borderRadius:8,display:'block'}}>
      <rect width={size} height={size} fill="#fff" />
      {cells.flatMap((row,r) => row.map((f,c) => f
        ? <rect key={`${r},${c}`} x={c*cs} y={r*cs} width={cs} height={cs} fill="#0d0d1a" />
        : null
      ))}
    </svg>
  );
}

// ─── Animated Bank Card ─────────────────────────────────────
function CardVisual({ num, name, expiry, flipped, type }) {
  const grad = CARD_GRAD[type] ?? CARD_GRAD.null;
  const displayNum = (num.replace(/\s/g,'')+' '.repeat(16)).slice(0,16);
  const groups = [0,4,8,12].map(i => displayNum.slice(i,i+4));

  return (
    <div className="payment-card-wrapper" style={{width:'100%',maxWidth:340,margin:'0 auto',height:200,perspective:1000}}>
      <div className={`payment-card${flipped?' flipped':''}`} style={{width:'100%',height:'100%',position:'relative',transformStyle:'preserve-3d',transition:'transform 0.6s cubic-bezier(0.4,0,0.2,1)'}}>

        {/* Front */}
        <div style={{
          position:'absolute',inset:0,backfaceVisibility:'hidden',
          background:grad, borderRadius:16, padding:'20px 24px',
          boxShadow:'0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15)',
          display:'flex',flexDirection:'column',justifyContent:'space-between',
          border:'1px solid rgba(255,255,255,0.12)',
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            {/* Chip */}
            <svg width={40} height={30} viewBox="0 0 40 30">
              <rect x={1} y={1} width={38} height={28} rx={4} fill="#C8A84B" stroke="#A07830" strokeWidth={0.5}/>
              <line x1={13} y1={1} x2={13} y2={29} stroke="#A07830" strokeWidth={0.7}/>
              <line x1={27} y1={1} x2={27} y2={29} stroke="#A07830" strokeWidth={0.7}/>
              <line x1={1} y1={10} x2={39} y2={10} stroke="#A07830" strokeWidth={0.7}/>
              <line x1={1} y1={20} x2={39} y2={20} stroke="#A07830" strokeWidth={0.7}/>
              <rect x={13} y={10} width={14} height={10} fill="#B8943C" stroke="#A07830" strokeWidth={0.5}/>
            </svg>
            {/* Card type logo */}
            <div style={{fontFamily:'DM Mono,monospace',fontSize:13,fontWeight:700,letterSpacing:2,color:'rgba(255,255,255,0.85)',textTransform:'uppercase'}}>
              {type==='mir' && <span style={{background:'linear-gradient(90deg,#1DB954,#4CAF50)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',fontSize:15,fontWeight:800}}>МИР</span>}
              {type==='visa' && <span style={{fontStyle:'italic',fontFamily:'serif',fontSize:20,letterSpacing:0}}>VISA</span>}
              {type==='mc' && (
                <svg width={40} height={24} viewBox="0 0 40 24">
                  <circle cx={14} cy={12} r={11} fill="#EB001B" opacity={0.9}/>
                  <circle cx={26} cy={12} r={11} fill="#F79E1B" opacity={0.9}/>
                  <path d="M20 4.5 a11 11 0 0 1 0 15 a11 11 0 0 1 0-15z" fill="#FF5F00" opacity={0.85}/>
                </svg>
              )}
              {!type && <span style={{opacity:0.5,fontSize:11}}>CARD</span>}
            </div>
          </div>

          {/* Number */}
          <div style={{display:'flex',gap:12,justifyContent:'center',fontFamily:'DM Mono,monospace',fontSize:18,letterSpacing:4,color:'rgba(255,255,255,0.9)',textShadow:'0 1px 3px rgba(0,0,0,0.5)'}}>
            {groups.map((g,i) => (
              <span key={i}>{g.replace(/./g, (c,j) => {
                if (num.replace(/\s/g,'').length > i*4+j) return num.replace(/\s/g,'')[i*4+j];
                return '•';
              })}</span>
            ))}
          </div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
            <div>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:9,color:'rgba(255,255,255,0.5)',letterSpacing:1,marginBottom:2}}>CARD HOLDER</div>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:13,color:'rgba(255,255,255,0.85)',letterSpacing:1.5,textTransform:'uppercase'}}>
                {name||'FULL NAME'}
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:9,color:'rgba(255,255,255,0.5)',letterSpacing:1,marginBottom:2}}>EXPIRES</div>
              <div style={{fontFamily:'DM Mono,monospace',fontSize:13,color:'rgba(255,255,255,0.85)',letterSpacing:2}}>
                {expiry||'MM/YY'}
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div style={{
          position:'absolute',inset:0,backfaceVisibility:'hidden',transform:'rotateY(180deg)',
          background:grad, borderRadius:16,
          boxShadow:'0 20px 60px rgba(0,0,0,0.7)',
          border:'1px solid rgba(255,255,255,0.12)',
          overflow:'hidden',
        }}>
          <div style={{height:40,background:'rgba(0,0,0,0.8)',marginTop:28,width:'100%'}}/>
          <div style={{padding:'16px 24px',display:'flex',alignItems:'center',gap:12}}>
            <div style={{flex:1,height:36,background:'rgba(255,255,255,0.85)',borderRadius:4}}/>
            <div style={{background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:4,padding:'4px 12px',fontFamily:'DM Mono,monospace',fontSize:14,color:'rgba(255,255,255,0.9)',letterSpacing:3,minWidth:52,textAlign:'center'}}>
              CVV
            </div>
          </div>
          <div style={{padding:'0 24px',fontFamily:'DM Mono,monospace',fontSize:9,color:'rgba(255,255,255,0.4)',letterSpacing:1}}>
            3-ЗНАЧНЫЙ КОД НА ОБОРОТЕ КАРТЫ
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Processing Overlay ─────────────────────────────────────
function ProcessingOverlay({ step, result, onRetry, orderId, onSuccess }) {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (result === 'success') {
      setTimeout(() => {
        setExiting(true);
        setTimeout(() => navigate(`/orders/${orderId}`), 600);
      }, 2000);
    }
  }, [result, orderId, navigate]);

  return (
    <div style={{
      position:'fixed',inset:0,zIndex:100,
      background:'rgba(8,8,16,0.92)',backdropFilter:'blur(20px)',
      display:'flex',alignItems:'center',justifyContent:'center',
      opacity: exiting ? 0 : 1, transition:'opacity 0.6s ease',
    }}>
      <div className="glass" style={{
        borderRadius:24,padding:'clamp(32px,6vw,56px)',
        maxWidth:420,width:'90%',textAlign:'center',
        border:'1px solid var(--glass-border)',
      }}>
        {!result && (
          <>
            <div style={{marginBottom:32}}>
              <div style={{
                width:64,height:64,margin:'0 auto 20px',
                borderRadius:'50%',border:'2px solid var(--accent)',
                display:'flex',alignItems:'center',justifyContent:'center',
                position:'relative',
              }}>
                <div style={{
                  position:'absolute',inset:-4,borderRadius:'50%',
                  border:'2px solid transparent',borderTopColor:'var(--accent)',
                  animation:'spin 0.9s linear infinite',
                }}/>
                <Lock size={24} color="var(--accent)" />
              </div>
              <div className="font-display tracking-widest text-xl" style={{color:'var(--text-primary)',marginBottom:8}}>
                ОБРАБОТКА ПЛАТЕЖА
              </div>
              <div className="font-mono text-xs" style={{color:'var(--text-muted)'}}>
                Не закрывайте страницу
              </div>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {STEPS.map((s,i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <div key={s} style={{
                    display:'flex',alignItems:'center',gap:12,
                    padding:'10px 14px',borderRadius:10,
                    background: active ? 'rgba(255,77,0,0.08)' : done ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${active ? 'rgba(255,77,0,0.25)' : done ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)'}`,
                    transition:'all 0.4s ease',
                  }}>
                    <div style={{
                      width:22,height:22,borderRadius:'50%',flexShrink:0,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      background: done ? 'rgba(74,222,128,0.15)' : active ? 'rgba(255,77,0,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${done ? 'rgba(74,222,128,0.4)' : active ? 'rgba(255,77,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    }}>
                      {done
                        ? <Check size={12} color="#4ADE80" />
                        : active
                          ? <div style={{width:8,height:8,borderRadius:'50%',background:'var(--accent)',animation:'payment-pulse 1s ease infinite'}}/>
                          : <div style={{width:6,height:6,borderRadius:'50%',background:'var(--text-muted)'}}/>
                      }
                    </div>
                    <span className="font-sans text-sm" style={{
                      color: done ? '#4ADE80' : active ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}>{s}</span>
                    {active && <div className="font-mono text-xs ml-auto" style={{color:'var(--accent)'}}>...</div>}
                    {done && <Check size={14} color="#4ADE80" style={{marginLeft:'auto'}}/>}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {result === 'success' && (
          <div style={{animation:'payment-fadein 0.5s ease'}}>
            <div style={{
              width:80,height:80,margin:'0 auto 24px',borderRadius:'50%',
              background:'rgba(74,222,128,0.12)',border:'2px solid rgba(74,222,128,0.4)',
              display:'flex',alignItems:'center',justifyContent:'center',
              animation:'payment-success-pop 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            }}>
              <svg width={36} height={36} viewBox="0 0 36 36" fill="none">
                <polyline points="7,18 15,26 29,10" stroke="#4ADE80" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                  style={{strokeDasharray:40,strokeDashoffset:0,animation:'payment-checkmark 0.5s 0.2s ease forwards'}}/>
              </svg>
            </div>
            <div className="font-display tracking-widest text-2xl mb-3" style={{color:'var(--text-primary)'}}>ОПЛАТА ПРОШЛА</div>
            <div className="font-sans text-sm mb-1" style={{color:'var(--text-secondary)'}}>Заказ успешно оплачен</div>
            <div className="font-mono text-xs" style={{color:'var(--text-muted)'}}>Переход к заказу...</div>
            <div style={{display:'flex',justifyContent:'center',marginTop:16}}>
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{borderColor:'var(--border-strong)',borderTopColor:'var(--accent)'}}/>
            </div>
          </div>
        )}

        {result === 'fail' && (
          <div style={{animation:'payment-fadein 0.5s ease'}}>
            <div style={{
              width:80,height:80,margin:'0 auto 24px',borderRadius:'50%',
              background:'rgba(248,113,113,0.1)',border:'2px solid rgba(248,113,113,0.35)',
              display:'flex',alignItems:'center',justifyContent:'center',
            }}>
              <X size={36} color="#f87171" />
            </div>
            <div className="font-display tracking-widest text-2xl mb-3" style={{color:'var(--text-primary)'}}>ОШИБКА ОПЛАТЫ</div>
            <div className="font-sans text-sm mb-6" style={{color:'var(--text-secondary)'}}>Проверьте данные и попробуйте снова</div>
            <button onClick={onRetry} style={{
              display:'flex',alignItems:'center',gap:8,margin:'0 auto',
              padding:'12px 28px',background:'var(--accent)',color:'#fff',
              border:'none',borderRadius:10,cursor:'pointer',
              fontFamily:'DM Sans,sans-serif',fontWeight:600,fontSize:14,
              boxShadow:'0 4px 24px var(--accent-glow)',
            }}>
              <RefreshCw size={16} /> Попробовать снова
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Input style helper ─────────────────────────────────────
const inp = (focus) => ({
  width:'100%', padding:'10px 14px',
  background:'var(--bg-raised)', border:`1px solid ${focus ? 'var(--accent)' : 'var(--border-strong)'}`,
  color:'var(--text-primary)', fontSize:14, outline:'none',
  fontFamily:'DM Mono,monospace', borderRadius:8,
  transition:'border-color 0.2s',
});

// ─── Card Form ──────────────────────────────────────────────
function CardForm({ onSubmit, loading }) {
  const [num,  setNum]   = useState('');
  const [exp,  setExp]   = useState('');
  const [cvv,  setCvv]   = useState('');
  const [name, setName]  = useState('');
  const [flipped, setFlipped] = useState(false);
  const [focus, setFocus] = useState(null);
  const type = cardType(num);

  const valid = num.replace(/\s/g,'').length===16 && exp.length===5 && cvv.length>=3 && name.trim().length>=2;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <CardVisual num={num} name={name} expiry={exp} flipped={flipped} type={type}/>

      {/* Card number */}
      <div>
        <label className="block font-mono text-xs tracking-wider uppercase mb-2" style={{color:'var(--text-muted)'}}>Номер карты</label>
        <input
          type="text" inputMode="numeric" value={num} placeholder="0000 0000 0000 0000"
          style={inp(focus==='num')}
          onFocus={() => { setFocus('num'); setFlipped(false); }}
          onBlur={() => setFocus(null)}
          onChange={e => setNum(fmtCardNum(e.target.value))}
        />
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div>
          <label className="block font-mono text-xs tracking-wider uppercase mb-2" style={{color:'var(--text-muted)'}}>Срок действия</label>
          <input
            type="text" inputMode="numeric" value={exp} placeholder="MM/YY"
            style={inp(focus==='exp')}
            onFocus={() => { setFocus('exp'); setFlipped(false); }}
            onBlur={() => setFocus(null)}
            onChange={e => setExp(fmtExpiry(e.target.value))}
          />
        </div>
        <div>
          <label className="block font-mono text-xs tracking-wider uppercase mb-2" style={{color:'var(--text-muted)'}}>CVV / CVC</label>
          <input
            type="password" inputMode="numeric" value={cvv} placeholder="•••" maxLength={4}
            style={inp(focus==='cvv')}
            onFocus={() => { setFocus('cvv'); setFlipped(true); }}
            onBlur={() => { setFocus(null); setFlipped(false); }}
            onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))}
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs tracking-wider uppercase mb-2" style={{color:'var(--text-muted)'}}>Имя держателя карты</label>
        <input
          type="text" value={name} placeholder="IVAN IVANOV"
          style={{...inp(focus==='name'),textTransform:'uppercase'}}
          onFocus={() => { setFocus('name'); setFlipped(false); }}
          onBlur={() => setFocus(null)}
          onChange={e => setName(e.target.value.toUpperCase().replace(/[^A-Z\s]/g,''))}
        />
      </div>

      <PayBtn valid={valid} loading={loading} onClick={() => onSubmit()} />
    </div>
  );
}

// ─── SBP Form ───────────────────────────────────────────────
function SBPForm({ onSubmit, loading }) {
  const [bank, setBank] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const handleSelect = (b) => {
    setBank(b);
    setTimeout(() => setShowQR(true), 300);
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div className="font-mono text-xs tracking-wider uppercase mb-1" style={{color:'var(--text-muted)'}}>Выберите банк</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {BANKS_SBP.map(b => (
          <button key={b.id} onClick={() => handleSelect(b)} style={{
            padding:'10px 6px', borderRadius:10, cursor:'pointer',
            background: bank?.id===b.id ? b.color : 'var(--bg-raised)',
            border: `1px solid ${bank?.id===b.id ? b.color : 'var(--border-strong)'}`,
            color: bank?.id===b.id ? b.text : 'var(--text-secondary)',
            fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:600,
            transition:'all 0.2s',
            boxShadow: bank?.id===b.id ? `0 4px 16px ${b.color}55` : 'none',
          }}>
            {b.name}
          </button>
        ))}
      </div>

      {bank && (
        <div style={{animation:'payment-fadein 0.4s ease',textAlign:'center'}}>
          <div className="glass" style={{
            borderRadius:16, padding:24, display:'inline-flex',
            flexDirection:'column', alignItems:'center', gap:16,
          }}>
            <div style={{
              padding:12, background:'#fff', borderRadius:12,
              boxShadow:'0 0 0 1px rgba(255,255,255,0.1)',
              animation: showQR ? 'payment-qr-pulse 2s ease infinite' : 'none',
            }}>
              <MockQR size={160}/>
            </div>
            <div>
              <div className="font-display tracking-widest text-sm mb-1" style={{color:'var(--text-primary)'}}>{bank.name}</div>
              <div className="font-mono text-xs" style={{color:'var(--text-muted)'}}>Отсканируйте QR-код в приложении банка</div>
            </div>
            <div style={{
              padding:'6px 14px', borderRadius:20,
              background:'rgba(255,77,0,0.1)', border:'1px solid rgba(255,77,0,0.2)',
            }}>
              <span className="font-mono text-xs" style={{color:'var(--accent)'}}>
                СБП · Быстрые платежи
              </span>
            </div>
          </div>
        </div>
      )}

      <PayBtn valid={!!bank} loading={loading} onClick={() => onSubmit()} label={bank ? `Оплатить через ${bank.name}` : undefined} />
    </div>
  );
}

// ─── Phone Form ─────────────────────────────────────────────
function PhoneForm({ onSubmit, loading }) {
  const [phone, setPhone] = useState('');
  const [focus, setFocus] = useState(false);

  const digits = phone.replace(/\D/g,'');
  const valid = digits.length >= 11;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div className="glass" style={{borderRadius:14,padding:'16px 20px'}}>
        <div className="font-mono text-xs tracking-wider uppercase mb-1" style={{color:'var(--text-muted)'}}>Как это работает</div>
        <p className="font-sans text-sm" style={{color:'var(--text-secondary)',lineHeight:1.6}}>
          Платёж спишется с баланса мобильного телефона. Банк, привязанный к номеру, будет определён автоматически.
        </p>
      </div>

      <div>
        <label className="block font-mono text-xs tracking-wider uppercase mb-2" style={{color:'var(--text-muted)'}}>Номер телефона</label>
        <input
          type="tel" inputMode="numeric" value={phone} placeholder="+7 (___) ___-__-__"
          style={{...inp(focus),fontSize:18,letterSpacing:2}}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={e => setPhone(fmtPhone(e.target.value))}
        />
      </div>

      {valid && (
        <div style={{
          display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,
          background:'rgba(74,222,128,0.06)',border:'1px solid rgba(74,222,128,0.2)',
          animation:'payment-fadein 0.3s ease',
        }}>
          <Check size={16} color="#4ADE80"/>
          <span className="font-sans text-sm" style={{color:'#4ADE80'}}>Номер определён · Сбербанк</span>
        </div>
      )}

      <PayBtn valid={valid} loading={loading} onClick={() => onSubmit()} />
    </div>
  );
}

// ─── Operator Form ──────────────────────────────────────────
function OperatorForm({ onSubmit, loading, price }) {
  const [op, setOp] = useState(null);
  const [phone, setPhone] = useState('');
  const [focus, setFocus] = useState(false);
  const digits = phone.replace(/\D/g,'');
  const valid = !!op && digits.length >= 11;
  const tooExpensive = price > 15000;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      {tooExpensive && (
        <div style={{
          padding:'12px 16px',borderRadius:10,
          background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.25)',
        }}>
          <p className="font-sans text-sm" style={{color:'#fbbf24',lineHeight:1.5}}>
            ⚠ Лимит оплаты через оператора — 15 000 ₽. Сумма вашего заказа превышает лимит. Выберите другой способ оплаты.
          </p>
        </div>
      )}

      <div>
        <div className="font-mono text-xs tracking-wider uppercase mb-3" style={{color:'var(--text-muted)'}}>Оператор связи</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {OPERATORS.map(o => (
            <button key={o.id} onClick={() => setOp(o)} style={{
              padding:'14px 16px', borderRadius:12, cursor:'pointer',
              background: op?.id===o.id ? o.color : 'var(--bg-raised)',
              border: `1px solid ${op?.id===o.id ? o.color : 'var(--border-strong)'}`,
              color: op?.id===o.id ? o.text : 'var(--text-secondary)',
              fontFamily:'DM Sans,sans-serif', fontSize:16, fontWeight:700,
              transition:'all 0.2s',
              boxShadow: op?.id===o.id ? `0 6px 20px ${o.color}55` : 'none',
              display:'flex',flexDirection:'column',gap:4,alignItems:'center',
            }}>
              <span>{o.name}</span>
              <span style={{fontSize:10,fontWeight:400,opacity:0.7}}>до 15 000 ₽</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs tracking-wider uppercase mb-2" style={{color:'var(--text-muted)'}}>Номер телефона</label>
        <input
          type="tel" inputMode="numeric" value={phone} placeholder="+7 (___) ___-__-__"
          style={{...inp(focus),fontSize:16,letterSpacing:1.5}}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={e => setPhone(fmtPhone(e.target.value))}
        />
      </div>

      <PayBtn valid={valid && !tooExpensive} loading={loading} onClick={() => onSubmit()} />
    </div>
  );
}

// ─── Pay Button ─────────────────────────────────────────────
function PayBtn({ valid, onClick, label, loading }) {
  const active = valid && !loading;
  return (
    <button onClick={onClick} disabled={!active} style={{
      width:'100%', padding:'15px 0',
      background: active ? 'linear-gradient(135deg,var(--accent),#fb923c)' : 'var(--bg-raised)',
      color: active ? '#fff' : 'var(--text-muted)',
      border:'none', borderRadius:12, cursor: active ? 'pointer' : 'not-allowed',
      fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:15,
      boxShadow: active ? '0 4px 24px var(--accent-glow)' : 'none',
      transition:'all 0.2s',
      display:'flex',alignItems:'center',justifyContent:'center',gap:8,
    }}>
      {loading
        ? <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{borderColor:'rgba(255,255,255,0.3)',borderTopColor:'#fff'}}/> Переход к оплате...</>
        : <><Lock size={15}/>{label || 'Оплатить'}<ChevronRight size={16}/></>
      }
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!orderId) { navigate('/dashboard'); return; }
    ordersApi.getOrderById(orderId)
      .then(data => setOrder(data.data?.order || data.order || data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  const runPayment = async () => {
    setProcessing(true);
    try {
      const res = await paymentsApi.createPayment({ orderId, method });
      const { confirmationUrl, paymentId } = res.data;
      // Сохраняем paymentId — нужен на странице колбэка
      sessionStorage.setItem(`payment_${orderId}`, paymentId);
      window.location.href = confirmationUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка создания платежа');
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg)'}}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{borderColor:'var(--border-strong)',borderTopColor:'var(--accent)'}}/>
        <p className="font-mono text-xs tracking-widest uppercase" style={{color:'var(--text-muted)'}}>Загрузка...</p>
      </div>
    </div>
  );

  const price = order?.price ?? 0;
  const orderNum = order?.orderNumber ?? order?.id ?? '—';

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',padding:'clamp(16px,4vw,40px) clamp(16px,4vw,24px)'}}>
      <div style={{maxWidth:500,margin:'0 auto'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28}}>
          <button onClick={() => navigate(-1)} style={{
            display:'flex',alignItems:'center',gap:6,background:'none',
            border:'none',cursor:'pointer',color:'var(--text-secondary)',
            fontFamily:'DM Sans,sans-serif',fontSize:13,padding:'4px 0',
          }}>
            <ArrowLeft size={16}/> Назад
          </button>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <Shield size={14} color="#4ADE80"/>
            <span className="font-mono text-xs" style={{color:'#4ADE80',letterSpacing:0.5}}>Безопасная оплата</span>
          </div>
        </div>

        {/* Title */}
        <div className="font-mono text-xs tracking-widest uppercase mb-1" style={{color:'var(--accent)'}}>/ оплата</div>
        <h1 className="font-display tracking-widest text-3xl mb-6" style={{color:'var(--text-primary)'}}>ОПЛАТА ЗАКАЗА</h1>

        {/* Order Summary */}
        <div className="glass" style={{borderRadius:16,padding:'16px 20px',marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div className="font-mono text-xs tracking-wider uppercase mb-1" style={{color:'var(--text-muted)'}}>Заказ №{orderNum}</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {order?.material && <span className="font-sans text-xs" style={{color:'var(--text-secondary)'}}>{order.material}</span>}
                {order?.quality  && <span className="font-sans text-xs" style={{color:'var(--text-muted)'}}>·</span>}
                {order?.quality  && <span className="font-sans text-xs" style={{color:'var(--text-secondary)'}}>{order.quality}</span>}
                {order?.quantity && <span className="font-sans text-xs" style={{color:'var(--text-muted)'}}>· {order.quantity} шт.</span>}
              </div>
            </div>
            <div className="font-display tracking-widest text-2xl" style={{color:'var(--accent)'}}>{price} ₽</div>
          </div>
        </div>

        {/* Payment card */}
        <div className="glass" style={{borderRadius:20,padding:'clamp(20px,4vw,28px)'}}>
          {/* Method tabs */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginBottom:24}}>
            {METHODS.map(({id,label,Icon}) => (
              <button key={id} onClick={() => setMethod(id)} style={{
                padding:'10px 4px', borderRadius:10, cursor:'pointer',
                background: method===id ? 'var(--accent-dim)' : 'var(--bg-raised)',
                border: `1px solid ${method===id ? 'rgba(255,77,0,0.4)' : 'var(--border-strong)'}`,
                color: method===id ? 'var(--accent)' : 'var(--text-muted)',
                display:'flex',flexDirection:'column',alignItems:'center',gap:5,
                transition:'all 0.2s',
              }}>
                <Icon size={16}/>
                <span style={{fontFamily:'DM Sans,sans-serif',fontSize:10,fontWeight:500}}>{label}</span>
              </button>
            ))}
          </div>

          {/* Active form */}
          <div style={{animation:'payment-fadein 0.3s ease'}}>
            {method==='card'     && <CardForm    onSubmit={runPayment} loading={processing} />}
            {method==='sbp'      && <SBPForm     onSubmit={runPayment} loading={processing} />}
            {method==='phone'    && <PhoneForm   onSubmit={runPayment} loading={processing} />}
            {method==='operator' && <OperatorForm onSubmit={runPayment} loading={processing} price={price} />}
          </div>

          {/* Security note */}
          <div style={{
            display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            marginTop:20,paddingTop:16,borderTop:'1px solid var(--border)',
          }}>
            <Lock size={12} color="var(--text-muted)"/>
            <span className="font-mono text-xs" style={{color:'var(--text-muted)'}}>Данные защищены · 256-bit SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
