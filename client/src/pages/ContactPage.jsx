import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const YOUR_EMAIL = 'i43231360@gmail.com';

const CONTACTS = [
  { icon: MapPin, label: 'Адрес',   value: 'г. Москва, ул. Мастеров, д. 12, стр. 3', link: null },
  { icon: Phone,  label: 'Телефон', value: '+7 (495) 123-45-67', link: 'tel:+74951234567' },
  { icon: Mail,   label: 'Email',   value: YOUR_EMAIL, link: `mailto:${YOUR_EMAIL}` },
];

const HOURS = [
  { days: 'Пн–Пт',      time: '09:00 – 20:00' },
  { days: 'Суббота',     time: '10:00 – 18:00' },
  { days: 'Воскресенье', time: 'Выходной' },
];

const inputStyle = {
  width: '100%', padding: '12px 14px',
  background: 'var(--glass-bg)', border: '1px solid var(--border-strong)',
  color: 'var(--text-primary)', fontSize: 14, outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  backdropFilter: 'blur(8px)',
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Заполните обязательные поля'); return; }
    setSending(true);
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${YOUR_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email,
          phone: form.phone || 'не указан', message: form.message,
          _subject: `Новое сообщение с сайта 3D Print Lab от ${form.name}`,
          _captcha: 'false',
        }),
      });
      const data = await res.json();
      if (data.success === 'true' || data.success === true) {
        setSent(true);
        toast.success('Сообщение отправлено!');
      } else throw new Error('fail');
    } catch {
      toast.error('Не удалось отправить. Напишите напрямую на ' + YOUR_EMAIL);
    } finally { setSending(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '48px 0 32px' }}>
        <div className="container mx-auto px-6">
          <p className="font-mono text-xs tracking-widest2 uppercase mb-3" style={{ color: 'var(--accent)' }}>/ контакты</p>
          <h1 className="font-display tracking-widest mb-3" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            СВЯЗАТЬСЯ С НАМИ
          </h1>
          <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>Есть вопросы? Напишите или позвоните — ответим быстро</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Left — info */}
          <div className="space-y-4">
            {/* Contacts */}
            <div className="glass p-6">
              <p className="font-mono text-[10px] tracking-widest2 uppercase mb-5" style={{ color: 'var(--text-muted)' }}>Контакты</p>
              <div className="space-y-5">
                {CONTACTS.map(({ icon: Icon, label, value, link }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-9 h-9 flex items-center justify-center shrink-0"
                      style={{ background: 'var(--accent-dim)', border: '1px solid rgba(255,77,0,0.2)' }}>
                      <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                      {link ? (
                        <a href={link} className="font-sans text-sm font-medium transition-colors duration-200"
                          style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
                          {value}
                        </a>
                      ) : (
                        <p className="font-sans text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="glass p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 flex items-center justify-center"
                  style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <Clock className="w-4 h-4" style={{ color: '#4ADE80' }} />
                </div>
                <p className="font-mono text-[10px] tracking-widest2 uppercase" style={{ color: 'var(--text-muted)' }}>Режим работы</p>
              </div>
              <div className="space-y-0">
                {HOURS.map(({ days, time }) => (
                  <div key={days} className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>{days}</span>
                    <span className="font-mono text-sm font-medium"
                      style={{ color: time === 'Выходной' ? '#f87171' : 'var(--text-primary)' }}>
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="glass overflow-hidden">
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 relative"
                style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.06), rgba(255,77,0,0.04))' }}>
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(79,142,247,0.08) 0%, transparent 70%)' }} />
                <MapPin className="w-8 h-8 mb-2 relative z-10" style={{ color: 'var(--accent)' }} />
                <p className="font-sans text-sm font-medium mb-3 relative z-10" style={{ color: 'var(--text-primary)' }}>
                  г. Москва, ул. Мастеров, д. 12
                </p>
                <a href="https://yandex.ru/maps/?text=Москва,+ул+Мастеров+12"
                  target="_blank" rel="noopener noreferrer"
                  className="relative z-10 font-mono text-xs tracking-wider uppercase px-4 py-2 transition-colors"
                  style={{ background: 'var(--accent)', color: '#000' }}>
                  Открыть на карте
                </a>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="glass p-6">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 gap-5">
                <CheckCircle className="w-14 h-14" style={{ color: '#4ADE80' }} />
                <div>
                  <h3 className="font-display tracking-widest text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
                    ОТПРАВЛЕНО
                  </h3>
                  <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Мы ответим в течение рабочего дня
                  </p>
                </div>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }}
                  className="font-mono text-xs tracking-wider uppercase px-6 py-3 transition-colors"
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}>
                  Отправить ещё
                </button>
              </div>
            ) : (
              <>
                <p className="font-mono text-[10px] tracking-widest2 uppercase mb-6" style={{ color: 'var(--text-muted)' }}>Написать нам</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { key: 'name', label: 'Имя', type: 'text', placeholder: 'Ваше имя', required: true },
                    { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
                    { key: 'phone', label: 'Телефон', type: 'tel', placeholder: '+7 (___) ___-__-__', required: false },
                  ].map(({ key, label, type, placeholder, required }) => (
                    <div key={key}>
                      <label className="font-mono text-[10px] tracking-wider uppercase block mb-2" style={{ color: 'var(--text-muted)' }}>
                        {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
                      </label>
                      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder} style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-strong)'} />
                    </div>
                  ))}
                  <div>
                    <label className="font-mono text-[10px] tracking-wider uppercase block mb-2" style={{ color: 'var(--text-muted)' }}>
                      Сообщение <span style={{ color: 'var(--accent)' }}>*</span>
                    </label>
                    <textarea rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Опишите ваш вопрос или задачу..."
                      style={{ ...inputStyle, resize: 'none' }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-strong)'} />
                  </div>
                  <button type="submit" disabled={sending}
                    className="w-full py-3 font-sans font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                    style={{ background: 'var(--accent)', color: '#000' }}>
                    {sending ? (
                      <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }} /> Отправляем...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Отправить сообщение</>
                    )}
                  </button>
                  <p className="font-mono text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
                    Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
