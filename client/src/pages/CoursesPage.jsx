// Страница списка курсов
import { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Clock, Users, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import * as coursesApi from '../api/courses.api';
import CourseCard from '../components/courses/CourseCard';

// Статические курсы — показываются всегда (даже без БД)
const STATIC_COURSES = [
  {
    id: 'static-1',
    title: 'Основы 3D-печати',
    description:
      'Курс для тех, кто только начинает знакомство с 3D-печатью. Вы узнаете о принципах работы FDM-принтеров, основных материалах, базовых настройках слайсера и типичных ошибках новичков.',
    level: 'BEGINNER',
    duration: '6 часов',
    students: 1240,
    lessons: [
      'Как работает FDM 3D-принтер',
      'Обзор материалов: PLA, ABS, PETG',
      'Установка и калибровка принтера',
      'Введение в слайсер Cura',
      'Первая печать: настройки и старт',
      'Разбор типичных ошибок печати',
    ],
  },
  {
    id: 'static-2',
    title: 'Материалы и параметры печати',
    description:
      'Углублённый курс по материалам. Изучите свойства PLA, ABS, PETG, TPU, Nylon; научитесь подбирать температуры, скорость и заполнение для разных задач.',
    level: 'INTERMEDIATE',
    duration: '8 часов',
    students: 860,
    lessons: [
      'Сравнение PLA, ABS, PETG, TPU, Nylon',
      'Температурные режимы и адгезия',
      'Заполнение (infill): паттерны и плотность',
      'Поддержки и рафты',
      'Постобработка: шлифовка, покраска',
      'Хранение и сушка филамента',
      'Практика: печать функциональных деталей',
      'Разбор сложных кейсов',
    ],
  },
  {
    id: 'static-3',
    title: 'Продвинутая 3D-печать и дизайн',
    description:
      'Для опытных пользователей: создание сложных моделей в Fusion 360 и Blender, многоматериальная печать, работа со смолой SLA/MSLA, оптимизация деталей под нагрузку.',
    level: 'ADVANCED',
    duration: '12 часов',
    students: 430,
    lessons: [
      'Моделирование в Fusion 360',
      'Органика и скульптинг в Blender',
      'Многоматериальная печать (MMU)',
      'SLA/MSLA: работа со смолой',
      'Инженерный расчёт прочности детали',
      'Печать крупногабаритных объектов',
      'Постобработка SLA-моделей',
      'Коммерческое использование 3D-печати',
    ],
  },
];

const levelColors = {
  BEGINNER: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  INTERMEDIATE: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  ADVANCED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};
const levelLabels = {
  BEGINNER: 'Начинающий',
  INTERMEDIATE: 'Средний',
  ADVANCED: 'Продвинутый',
};

function StaticCourseCard({ course }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col">
      <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
        <BookOpen className="w-16 h-16 text-white/30" />
        <span className="absolute top-3 right-3 text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
          Скоро доступен
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit mb-3 ${levelColors[course.level]}`}>
          {levelLabels[course.level]}
        </span>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{course.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{course.description}</p>

        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> {course.lessons.length} уроков
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {course.students.toLocaleString()}
          </span>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-between w-full text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-2"
        >
          <span>Программа курса</span>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {open && (
          <ol className="space-y-1.5 mb-4">
            {course.lessons.map((lesson, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="shrink-0 w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <span className="flex-1">{lesson}</span>
                <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </li>
            ))}
          </ol>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            disabled
            className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-lg text-sm font-semibold cursor-not-allowed"
          >
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

  useEffect(() => {
    loadCourses();
  }, [filter]);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const params = { published: 'true' };
      if (filter !== 'all') params.level = filter;
      const response = await coursesApi.getCourses(params);
      setCourses(response.data.data.courses || []);
    } catch {
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStatic =
    filter === 'all' ? STATIC_COURSES : STATIC_COURSES.filter((c) => c.level === filter);

  const filters = [
    { value: 'all', label: 'Все' },
    { value: 'BEGINNER', label: 'Начинающий' },
    { value: 'INTERMEDIATE', label: 'Средний' },
    { value: 'ADVANCED', label: 'Продвинутый' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <GraduationCap className="w-12 h-12 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Курсы 3D-печати
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Обучайтесь 3D-печати от основ до продвинутого уровня
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-10">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  filter === f.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : (
            <>
              {/* Курсы из БД */}
              {courses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}

              {/* Статические курсы-анонсы */}
              {filteredStatic.length > 0 && (
                <>
                  {courses.length > 0 && (
                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-6">
                      Готовятся к запуску
                    </h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStatic.map((course) => (
                      <StaticCourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </>
              )}

              {courses.length === 0 && filteredStatic.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                  <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Курсов с выбранным уровнем не найдено</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
