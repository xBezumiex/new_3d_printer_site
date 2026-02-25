// Главная страница
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Calculator, Package, Star, ArrowRight, Printer, Zap, Shield, HeartHandshake } from 'lucide-react';
import { getPosts } from '../api/posts.api';
import PostCard from '../components/posts/PostCard';

const STATS = [
  { value: '500+', label: 'Выполненных заказов' },
  { value: '5',    label: 'Лет опыта' },
  { value: '12',   label: 'Принтеров' },
  { value: '98%',  label: 'Довольных клиентов' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: Upload,     title: 'Загрузите модель',      desc: 'Загрузите STL, OBJ или 3MF файл прямо на сайте — без лишних шагов' },
  { step: '02', icon: Calculator, title: 'Рассчитайте стоимость', desc: 'Выберите материал, качество и заполнение — цена считается мгновенно' },
  { step: '03', icon: Package,    title: 'Получите заказ',        desc: 'Оформите заказ онлайн и отслеживайте статус в личном кабинете' },
];

const MATERIALS = [
  { name: 'PLA',   desc: 'Лёгкий в печати',         color: 'from-green-400 to-emerald-500' },
  { name: 'ABS',   desc: 'Прочный и термостойкий',   color: 'from-orange-400 to-amber-500' },
  { name: 'PETG',  desc: 'Универсальный',             color: 'from-blue-400 to-cyan-500' },
  { name: 'TPU',   desc: 'Гибкий',                   color: 'from-purple-400 to-violet-500' },
  { name: 'Nylon', desc: 'Максимальная прочность',   color: 'from-gray-500 to-slate-600' },
];

const REVIEWS = [
  { name: 'Дмитрий К.', rating: 5, text: 'Отличное качество печати! Заказал прототип корпуса — всё точь-в-точь по размерам. Буду обращаться ещё.' },
  { name: 'Анна М.',    rating: 5, text: 'Быстро, качественно, удобный сайт. Особенно понравился калькулятор стоимости — всё прозрачно.' },
  { name: 'Сергей П.',  rating: 5, text: 'Напечатали запчасть для старого принтера, которую нигде нельзя купить. Спасибо за профессионализм!' },
];

const FEATURES = [
  { icon: Zap,            title: 'Быстро',       desc: 'Стандартные заказы за 24–48 ч',         color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
  { icon: Shield,         title: 'Надёжно',      desc: 'Контроль качества каждого изделия',      color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { icon: Printer,        title: '12 принтеров', desc: 'Широкий выбор материалов и технологий', color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
  { icon: HeartHandshake, title: 'Поддержка',    desc: 'Консультируем на каждом этапе',          color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
];

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState([]);

  useEffect(() => {
    getPosts({ limit: 3, page: 1 })
      .then(res => setLatestPosts(res.data.data?.posts || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="relative container mx-auto px-4 py-24 text-center">
          <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/15 text-sm font-medium backdrop-blur-sm">
            🚀 Профессиональная 3D-печать в Москве
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">3D Print Lab</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Загрузите модель — получите готовое изделие.<br />Быстро, точно, по честной цене.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/upload"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-lg">
              <Upload className="w-5 h-5" /> Загрузить модель
            </Link>
            <Link to="/calculator"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500/40 border border-white/30 rounded-xl font-bold text-lg hover:bg-blue-500/60 transition">
              <Calculator className="w-5 h-5" /> Рассчитать цену
            </Link>
          </div>
        </div>
      </section>

      {/* СТАТИСТИКА */}
      <section className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{s.value}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* КАК ЭТО РАБОТАЕТ */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Как это работает</h2>
          <p className="text-gray-500 dark:text-gray-400">Три простых шага от идеи до готового изделия</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="relative text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
                <Icon className="w-8 h-8 text-white" />
              </div>
              <span className="absolute top-4 right-4 text-5xl font-black text-blue-50 dark:text-blue-900/40 select-none">{step}</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/upload" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Попробовать сейчас <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ПРЕИМУЩЕСТВА */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">Почему выбирают нас</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700">
                <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}><Icon className="w-7 h-7" /></div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* МАТЕРИАЛЫ */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Доступные материалы</h2>
          <p className="text-gray-500 dark:text-gray-400">От простого PLA до прочного нейлона</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {MATERIALS.map(m => (
            <Link key={m.name} to="/materials"
              className="group relative overflow-hidden rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-90`} />
              <div className="relative text-white">
                <p className="text-2xl font-black">{m.name}</p>
                <p className="text-sm text-white/80 mt-1">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link to="/materials" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Сравнить все материалы <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ПОСЛЕДНИЕ РАБОТЫ */}
      {latestPosts.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Последние работы</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Свежие проекты из нашей галереи</p>
              </div>
              <Link to="/posts" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline text-sm">
                Все работы <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {latestPosts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          </div>
        </section>
      )}

      {/* ОТЗЫВЫ */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Что говорят клиенты</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {REVIEWS.map(r => (
            <div key={r.name} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex text-yellow-400 mb-3">
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">"{r.text}"</p>
              <p className="font-semibold text-gray-900 dark:text-white">{r.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">Готовы напечатать что-то крутое?</h2>
          <p className="text-blue-100 mb-10 text-lg max-w-xl mx-auto">
            Загрузите STL-файл, получите цену за 10 секунд и оформите заказ онлайн
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/upload"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-700 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-lg">
              <Upload className="w-5 h-5" /> Загрузить модель
            </Link>
            <Link to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/50 rounded-xl font-bold text-lg hover:bg-white/10 transition">
              Связаться с нами
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
