// Страница контактов
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

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Заполните обязательные поля');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${YOUR_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || 'не указан',
          message: form.message,
          _subject: `Новое сообщение с сайта 3D Print Lab от ${form.name}`,
          _captcha: 'false',
        }),
      });
      const data = await res.json();
      if (data.success === 'true' || data.success === true) {
        setSent(true);
        toast.success('Сообщение отправлено!');
      } else {
        throw new Error('fail');
      }
    } catch {
      toast.error('Не удалось отправить. Напишите напрямую на ' + YOUR_EMAIL);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Контакты</h1>
          <p className="text-gray-600 dark:text-gray-400">Есть вопросы? Напишите или позвоните — ответим быстро</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Левая колонка — info */}
          <div className="space-y-6">
            {/* Контактные данные */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Наши контакты</h2>
              <div className="space-y-4">
                {CONTACTS.map(({ icon: Icon, label, value, link }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
                      {link ? (
                        <a href={link} className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition">
                          {value}
                        </a>
                      ) : (
                        <p className="font-medium text-gray-900 dark:text-white">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Режим работы */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Режим работы</h2>
              </div>
              <div className="space-y-3">
                {HOURS.map(({ days, time }) => (
                  <div key={days} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-gray-600 dark:text-gray-400">{days}</span>
                    <span className={`font-semibold ${time === 'Выходной' ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Карта (заглушка) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="h-52 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30 flex flex-col items-center justify-center text-center p-6">
                <MapPin className="w-10 h-10 text-blue-500 mb-2" />
                <p className="font-semibold text-gray-900 dark:text-white">г. Москва, ул. Мастеров, д. 12</p>
                <a
                  href="https://yandex.ru/maps/?text=Москва,+ул+Мастеров+12"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Открыть на карте
                </a>
              </div>
            </div>
          </div>

          {/* Правая колонка — форма */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            {sent ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 gap-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Сообщение отправлено!</h3>
                <p className="text-gray-500 dark:text-gray-400">Мы ответим вам в течение рабочего дня</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Отправить ещё
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Написать нам</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Имя <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Ваше имя"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+7 (___) ___-__-__"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Сообщение <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Опишите ваш вопрос или задачу..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-60"
                  >
                    {sending ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Отправляем...</>
                    ) : (
                      <><Send className="w-5 h-5" /> Отправить сообщение</>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 text-center">
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
