import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Clock, Users, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import * as coursesApi from '../api/courses.api';
import CourseCard from '../components/courses/CourseCard';

const STATIC_COURSES = [
  {
    id: 'static-1',
    title: 'Основы 3D-печати',
    description: 'Курс для тех, кто только начинает знакомство с 3D-печатью. Принципы FDM, материалы, базовые настройки слайсера и типичные ошибки новичков.',
    level: 'BEGINNER',
    duration: '6 часов',
    students: 1240,
    lessons: ['Как работает FDM 3D-принтер','Обзор материалов: PLA, ABS, PETG','Установка и калибровка принтера','Введение в слайсер Cura','Первая печать: настройки и старт','Разбор типичных ошибок печати'],
  },
  {
    id: 'static-2',
    title: 'Материалы и параметры печати',
    description: 'Углублённый курс по материалам. Свойства PLA, ABS, PETG, TPU, Nylon; температуры, скорость и заполнение для разных задач.',
    level: 'INTERMEDIATE',
    duration: '8 часов',
    students: 860,
    lessons: ['Сравнение PLA, ABS, PETG, TPU, Nylon','Температурные режимы и адгезия','Заполнение (infill): паттерны','Поддержки и рафты','Постобработка: шлифовка, покраска','Хранение и сушка филамента','Практика: функциональные детали','Разбор сложных кейсов'],
  },
  {
    id: 'static-3',
    title: 'Продвинутая 3D-печать и дизайн',
    description: 'Для опытных пользователей: Fusion 360, Blender, многоматериальная печать, SLA/MSLA, оптимизация деталей под нагрузку.',
    level: 'ADVANCED',
    duration: '12 часов',
    students: 430,
    lessons: ['Моделирование в Fusion 360','Органика и скульптинг в Blender','Многоматериальная печать (MMU)','SLA/MSLA: работа со смолой','Инженерный расчёт прочности','Печать крупногабаритных объектов','Постобработка SLA-моделей','Коммерческое использование 3D-печати'],
  },
];

const LEVEL_COLOR = { BEGINNER: '#4ADE80', INTERMEDIATE: '#FACC15', ADVANCED: '#FF4D00' };
const LEVEL_LABEL = { BEGINNER: 'Начинающий', INTERMEDIATE: 'Средний', ADVANCED: 'Продвинутый' };

function StaticCourseCard({ course }) {
  const [open, setOpen] = useState(false);
  const color = LEVEL_COLOR[course.level];

  return (
    <div className="glass glass-hover grad-border flex flex-col overflow-hidden">
      {/* Banner */}
      <div className="relative h-40 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}12, ${color}06)`, borderBottom: '1px solid var(--border)' }}>
        <BookOpen className="w-14 h-14" style={{ color: `${color}30` }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${color}08 0%, transparent 70%)` }} />
        <span className="glass absolute top-3 right-3 font-mono text-[10px] tracking-wider px-3 py-1"
          style={{ color: 'var(--text-muted)' }}>
          Скоро доступен
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-1 w-fit mb-4"
          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
          {LEVEL_LABEL[course.level]}
        </span>

        <h3 className="font-sans font-semibold mb-2" style={{ color: 'var(--text-primary)', fontSize: 16 }}>{course.title}</h3>
        <p className="font-sans text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.description}
        </p>

        <div className="flex gap-4 mb-5">
          {[
            [Clock, course.duration],
            [BookOpen, `${course.lessons.length} уроков`],
            [Users, course.students.toLocaleString()],
          ].map(([Icon, val]) => (
            <span key={val} className="flex items-center gap-1 font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <Icon className="w-3.5 h-3.5" /> {val}
            </span>
          ))}
        </div>

        <button onClick={() => setOpen(v => !v)}
          className="flex items-center justify-between w-full mb-3 transition-colors"
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
          <span>Программа курса</span>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {open && (
          <ol className="space-y-2 mb-4">
            {course.lessons.map((lesson, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="shrink-0 w-5 h-5 flex items-center justify-center font-mono text-[10px]"
                  style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {i + 1}
                </span>
                <span className="font-sans text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>{lesson}</span>
                <Lock className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
              </li>
            ))}
          </ol>
        )}

        <div className="mt-auto pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button disabled className="w-full py-2.5 font-sans text-sm font-medium cursor-not-allowed"
            style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Скоро откроется
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadCourses(); }, [filter]);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const params = { published: 'true' };
      if (filter !== 'all') params.level = filter;
      const res = await coursesApi.getCourses(params);
      setCourses(res.data.data.courses || []);
    } catch { setCourses([]); }
    finally { setIsLoading(false); }
  };

  const filteredStatic = filter === 'all' ? STATIC_COURSES : STATIC_COURSES.filter(c => c.level === filter);
  const filters = [
    { value: 'all',          label: 'Все' },
    { value: 'BEGINNER',     label: 'Начинающий' },
    { value: 'INTERMEDIATE', label: 'Средний' },
    { value: 'ADVANCED',     label: 'Продвинутый' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '48px 0 32px' }}>
        <div className="container mx-auto px-6">
          <p className="font-mono text-xs tracking-widest2 uppercase mb-3" style={{ color: 'var(--accent)' }}>/ обучение</p>
          <h1 className="font-display tracking-widest mb-3" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'var(--text-primary)', lineHeight: 1 }}>
            КУРСЫ 3D-ПЕЧАТИ
          </h1>
          <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>
            От основ до продвинутого уровня — обучайтесь в своём темпе
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {filters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className="font-mono text-xs tracking-wider transition-all duration-200"
              style={{
                padding: '6px 14px',
                background: filter === f.value ? 'var(--accent)' : 'var(--glass-bg)',
                color: filter === f.value ? '#000' : 'var(--text-secondary)',
                border: `1px solid ${filter === f.value ? 'var(--accent)' : 'var(--border-strong)'}`,
                backdropFilter: 'blur(8px)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
          </div>
        ) : (
          <>
            {courses.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {courses.map(c => <CourseCard key={c.id} course={c} />)}
              </div>
            )}

            {filteredStatic.length > 0 && (
              <>
                {courses.length > 0 && (
                  <p className="font-mono text-xs tracking-widest uppercase mb-6" style={{ color: 'var(--text-muted)' }}>
                    — Готовятся к запуску
                  </p>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredStatic.map(c => <StaticCourseCard key={c.id} course={c} />)}
                </div>
              </>
            )}

            {courses.length === 0 && filteredStatic.length === 0 && (
              <div className="glass py-20 text-center">
                <GraduationCap className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>Курсов с выбранным уровнем не найдено</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
