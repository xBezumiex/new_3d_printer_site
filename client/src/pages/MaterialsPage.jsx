// Каталог материалов для 3D-печати
import { useState } from 'react';

const MATERIALS = [
  {
    id: 'pla',
    name: 'PLA',
    fullName: 'Polylactic Acid',
    color: 'green',
    badge: 'Рекомендуется новичкам',
    tagline: 'Самый популярный материал для начинающих',
    description: 'PLA — биоразлагаемый термопласт на основе молочной кислоты. Прост в печати, не требует подогревного стола, даёт минимальную усадку. Идеален для декоративных изделий, прототипов и учебных проектов.',
    props: { temp: '190–220 °C', bed: '20–60 °C', density: '1.24 г/см³', strength: 'Средняя' },
    pros: ['Лёгкая печать', 'Нет запаха', 'Биоразлагаем', 'Низкая усадка', 'Широкий выбор цветов'],
    cons: ['Низкая термостойкость', 'Хрупкость при ударе', 'Боится влаги'],
    uses: ['Игрушки и сувениры', 'Прототипы', 'Декор', 'Образовательные модели'],
    gradient: 'from-green-400 to-emerald-600',
  },
  {
    id: 'abs',
    name: 'ABS',
    fullName: 'Acrylonitrile Butadiene Styrene',
    color: 'orange',
    badge: 'Для функциональных деталей',
    tagline: 'Прочный и термостойкий материал',
    description: 'ABS — один из самых распространённых инженерных пластиков. Отличается хорошей ударопрочностью и термостойкостью. Позволяет постобработку ацетоном для глянцевой поверхности.',
    props: { temp: '220–250 °C', bed: '80–110 °C', density: '1.04 г/см³', strength: 'Высокая' },
    pros: ['Высокая прочность', 'Термостойкость до 80–100 °C', 'Постобработка ацетоном', 'Хорошая гибкость'],
    cons: ['Запах при печати', 'Нужен обогревный стол', 'Усадка и коробление'],
    uses: ['Корпуса электроники', 'Автодетали', 'Инструменты', 'Бытовые изделия'],
    gradient: 'from-orange-400 to-amber-600',
  },
  {
    id: 'petg',
    name: 'PETG',
    fullName: 'Polyethylene Terephthalate Glycol',
    color: 'blue',
    badge: 'Лучшее соотношение качества и цены',
    tagline: 'Прочность ABS + простота PLA',
    description: 'PETG сочетает лучшие свойства PLA и ABS: высокую прочность, термостойкость и простоту печати. Пищебезопасен, водостойкий, не боится влаги. Отличный выбор для функциональных деталей.',
    props: { temp: '230–250 °C', bed: '70–85 °C', density: '1.27 г/см³', strength: 'Очень высокая' },
    pros: ['Прочность выше ABS', 'Пищебезопасен', 'Водостойкость', 'Хорошая адгезия слоёв', 'Минимальный запах'],
    cons: ['Нити при печати', 'Трудно шлифовать', 'Требует сушки'],
    uses: ['Ёмкости для жидкостей', 'Медицинские изделия', 'Механические детали', 'Наружные конструкции'],
    gradient: 'from-blue-400 to-cyan-600',
  },
  {
    id: 'tpu',
    name: 'TPU',
    fullName: 'Thermoplastic Polyurethane',
    color: 'purple',
    badge: 'Гибкий материал',
    tagline: 'Для эластичных и ударопоглощающих деталей',
    description: 'TPU — гибкий и эластичный термопластичный полиуретан. Незаменим там, где нужна упругость, ударопоглощение или стойкость к истиранию. Хорошо сцепляется с большинством поверхностей.',
    props: { temp: '220–240 °C', bed: '30–60 °C', density: '1.21 г/см³', strength: 'Средняя (гибкий)' },
    pros: ['Высокая эластичность', 'Ударопрочность', 'Стойкость к истиранию', 'Водо- и маслостойкость'],
    cons: ['Сложная печать', 'Медленная скорость', 'Требует прямой подачи'],
    uses: ['Чехлы для телефонов', 'Уплотнители', 'Обувные стельки', 'Прокладки', 'Игрушки'],
    gradient: 'from-purple-400 to-violet-600',
  },
  {
    id: 'nylon',
    name: 'Nylon',
    fullName: 'Polyamide (PA)',
    color: 'gray',
    badge: 'Для профессиональных задач',
    tagline: 'Максимальная прочность и износостойкость',
    description: 'Нейлон (полиамид) — инженерный материал с исключительной прочностью и износостойкостью. Применяется в промышленности для деталей, испытывающих высокие нагрузки и трение.',
    props: { temp: '240–260 °C', bed: '70–90 °C', density: '1.15 г/см³', strength: 'Максимальная' },
    pros: ['Высочайшая прочность', 'Износостойкость', 'Хим. стойкость', 'Гибкость под нагрузкой'],
    cons: ['Сильно впитывает влагу', 'Сложная печать', 'Коробление', 'Требует сушки'],
    uses: ['Шестерни', 'Подшипники', 'Инструменты', 'Промышленные детали', 'Протезы'],
    gradient: 'from-gray-500 to-slate-700',
  },
];

const COLOR_MAP = {
  green:  { badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', accent: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  orange: { badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', accent: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  blue:   { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', accent: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  purple: { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', accent: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  gray:   { badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', accent: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' },
};

export default function MaterialsPage() {
  const [selected, setSelected] = useState(null);

  const mat = selected ? MATERIALS.find(m => m.id === selected) : null;
  const c = mat ? COLOR_MAP[mat.color] : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Материалы для 3D-печати</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Выберите материал, чтобы узнать его характеристики, преимущества и область применения
          </p>
        </div>

        {/* Карточки выбора */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {MATERIALS.map(m => {
            const col = COLOR_MAP[m.color];
            const isActive = selected === m.id;
            return (
              <button key={m.id} onClick={() => setSelected(isActive ? null : m.id)}
                className={`px-5 py-3 rounded-xl font-bold text-lg shadow transition-all
                  ${isActive
                    ? `bg-gradient-to-br ${m.gradient} text-white scale-105 shadow-lg`
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:scale-105 hover:shadow-md'}`}>
                {m.name}
              </button>
            );
          })}
        </div>

        {/* Детальная карточка */}
        {mat && (
          <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border ${c.border} overflow-hidden max-w-4xl mx-auto mb-10`}>
            {/* Шапка */}
            <div className={`bg-gradient-to-r ${mat.gradient} p-8 text-white`}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-4xl font-black mb-1">{mat.name}</h2>
                  <p className="text-white/80 text-sm">{mat.fullName}</p>
                  <p className="text-lg mt-2 font-medium">{mat.tagline}</p>
                </div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                  {mat.badge}
                </span>
              </div>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* Описание */}
              <div className="md:col-span-2">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{mat.description}</p>
              </div>

              {/* Технические параметры */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Технические параметры</h3>
                <div className="space-y-2">
                  {Object.entries({ 'Температура сопла': mat.props.temp, 'Температура стола': mat.props.bed, 'Плотность': mat.props.density, 'Прочность': mat.props.strength }).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1.5 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">{k}</span>
                      <span className={`font-semibold ${c.accent}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Применение */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Применение</h3>
                <div className="flex flex-wrap gap-2">
                  {mat.uses.map(u => (
                    <span key={u} className={`px-3 py-1 rounded-full text-xs font-medium ${c.badge}`}>{u}</span>
                  ))}
                </div>
              </div>

              {/* Плюсы и минусы */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Преимущества</h3>
                <ul className="space-y-1">
                  {mat.pros.map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-green-500">✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Недостатки</h3>
                <ul className="space-y-1">
                  {mat.cons.map(c2 => (
                    <li key={c2} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-red-500">✗</span> {c2}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Сравнительная таблица */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Сравнение материалов</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Материал</th>
                  <th className="px-4 py-3 text-center">Прочность</th>
                  <th className="px-4 py-3 text-center">Гибкость</th>
                  <th className="px-4 py-3 text-center">Термостойкость</th>
                  <th className="px-4 py-3 text-center">Простота печати</th>
                  <th className="px-4 py-3 text-center">Цена</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {[
                  { name: 'PLA',   s: 2, f: 1, t: 1, e: 5, p: 1 },
                  { name: 'ABS',   s: 4, f: 2, t: 4, e: 3, p: 2 },
                  { name: 'PETG',  s: 4, f: 2, t: 3, e: 4, p: 2 },
                  { name: 'TPU',   s: 2, f: 5, t: 2, e: 2, p: 3 },
                  { name: 'Nylon', s: 5, f: 3, t: 5, e: 1, p: 4 },
                ].map(row => (
                  <tr key={row.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{row.name}</td>
                    {['s','f','t','e','p'].map(key => (
                      <td key={key} className="px-4 py-3 text-center">
                        <Stars count={row[key]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stars({ count }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  );
}
