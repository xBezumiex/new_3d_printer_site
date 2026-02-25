// Страница "О нас"
import { Link } from 'react-router-dom';
import { Printer, Users, Award, Zap } from 'lucide-react';

const STATS = [
  { value: '500+',  label: 'Выполненных заказов' },
  { value: '5',     label: 'Лет на рынке' },
  { value: '12',    label: 'Принтеров в парке' },
  { value: '98%',   label: 'Довольных клиентов' },
];

const TEAM = [
  {
    name: 'Алексей Соколов',
    role: 'Основатель & Технический директор',
    desc: '10+ лет опыта в аддитивных технологиях. Специализация на промышленной 3D-печати и разработке изделий.',
    avatar: null,
    initials: 'АС',
    color: 'from-blue-400 to-blue-600',
  },
  {
    name: 'Мария Петрова',
    role: 'Главный дизайнер',
    desc: 'Мастер 3D-моделирования в Blender и Fusion 360. Помогает клиентам адаптировать модели для печати.',
    avatar: null,
    initials: 'МП',
    color: 'from-pink-400 to-rose-600',
  },
  {
    name: 'Дмитрий Ковалёв',
    role: 'Инженер по постобработке',
    desc: 'Эксперт по шлифовке, окраске и финишной обработке. Превращает распечатки в идеальные изделия.',
    avatar: null,
    initials: 'ДК',
    color: 'from-green-400 to-emerald-600',
  },
];

const EQUIPMENT = [
  { name: 'Bambu Lab X1 Carbon', count: 4, desc: 'Высокоскоростные принтеры с мультиматериальной печатью' },
  { name: 'Prusa i3 MK3S+', count: 5, desc: 'Надёжные и точные принтеры для качественной печати' },
  { name: 'Voron 2.4', count: 2, desc: 'Высокотемпературные принтеры для инженерных материалов' },
  { name: 'Resin (Elegoo Saturn)', count: 1, desc: 'Фотополимерная печать для ювелирных деталей' },
];

const VALUES = [
  { icon: <Award className="w-8 h-8" />, title: 'Качество', desc: 'Каждый заказ проходит визуальный и размерный контроль перед отправкой клиенту', color: 'text-yellow-500' },
  { icon: <Zap className="w-8 h-8" />, title: 'Скорость', desc: 'Стандартные заказы выполняем за 24–48 часов. Срочная печать в день обращения', color: 'text-blue-500' },
  { icon: <Users className="w-8 h-8" />, title: 'Поддержка', desc: 'Помогаем выбрать материал и настройки. Консультируем бесплатно на любом этапе', color: 'text-green-500' },
  { icon: <Printer className="w-8 h-8" />, title: 'Точность', desc: 'Отклонение размеров не превышает ±0.2 мм. Используем калиброванное оборудование', color: 'text-purple-500' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-4">3D Print Lab</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Профессиональная 3D-печать в Москве. С 2019 года воплощаем идеи клиентов —
            от небольших прототипов до серийного производства.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/upload" className="px-8 py-3 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition">
              Заказать печать
            </Link>
            <Link to="/calculator" className="px-8 py-3 bg-blue-500/40 border border-white/30 rounded-xl font-bold hover:bg-blue-500/60 transition">
              Рассчитать стоимость
            </Link>
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section className="bg-white dark:bg-gray-800 py-12 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{s.value}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* О компании */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">Наша история</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 text-gray-600 dark:text-gray-400 leading-relaxed space-y-4">
            <p>
              <strong className="text-gray-900 dark:text-white">3D Print Lab</strong> был основан в 2019 году
              группой инженеров и дизайнеров, влюблённых в аддитивные технологии. Мы начинали с двух принтеров
              в небольшой мастерской и выполняли заказы для студентов и небольших компаний.
            </p>
            <p>
              Сегодня наш парк насчитывает 12 профессиональных принтеров различных классов. Мы работаем как с
              частными клиентами, так и с предприятиями — создаём прототипы, серийные детали, изделия на заказ
              из широкого спектра материалов.
            </p>
            <p>
              Наша миссия — сделать 3D-печать доступной и понятной для каждого. Поэтому мы создали онлайн-платформу,
              где можно загрузить модель, мгновенно рассчитать стоимость и оформить заказ без звонков и ожидания.
            </p>
          </div>
        </div>
      </section>

      {/* Ценности */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">Наши принципы</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700">
                <div className={`inline-block mb-4 ${v.color}`}>{v.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Оборудование */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">Наше оборудование</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {EQUIPMENT.map(e => (
              <div key={e.name} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <Printer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{e.name}</h3>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      × {e.count}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Команда */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">Наша команда</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TEAM.map(m => (
              <div key={m.name} className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}>
                  {m.initials}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{m.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">{m.role}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Загрузите вашу 3D-модель, рассчитайте стоимость и оформите заказ за 5 минут
          </p>
          <Link to="/upload" className="inline-block px-10 py-4 bg-white text-blue-700 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-lg">
            Загрузить модель
          </Link>
        </div>
      </section>
    </div>
  );
}
