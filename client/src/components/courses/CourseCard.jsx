// Карточка курса
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award } from 'lucide-react';

export default function CourseCard({ course }) {
  const getLevelBadge = (level) => {
    const badges = {
      BEGINNER: { text: 'Начинающий', color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' },
      INTERMEDIATE: { text: 'Средний', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' },
      ADVANCED: { text: 'Продвинутый', color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' },
    };
    return badges[level] || badges.BEGINNER;
  };

  const levelBadge = getLevelBadge(course.level);

  return (
    <Link
      to={`/courses/${course.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition overflow-hidden"
    >
      {/* Изображение */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen className="w-16 h-16 text-white" />
        )}
      </div>

      {/* Содержание */}
      <div className="p-6">
        {/* Уровень */}
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${levelBadge.color}`}>
            <Award className="w-3 h-3" />
            {levelBadge.text}
          </span>
        </div>

        {/* Название */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Описание */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>

        {/* Статистика */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course._count?.lessons || 0} уроков</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course._count?.progress || 0} студентов</span>
          </div>
        </div>

        {/* Прогресс (если есть) */}
        {course.progress && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Прогресс</span>
              <span className="text-gray-900 dark:text-white font-semibold">
                {course.progress.completedLessons} / {course.progress.totalLessons}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(course.progress.completedLessons / course.progress.totalLessons) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
