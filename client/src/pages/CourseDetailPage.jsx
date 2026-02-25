// Страница детального просмотра курса
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, Award, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as coursesApi from '../api/courses.api';
import toast from 'react-hot-toast';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    loadCourse();
    loadLessons();
    if (isAuthenticated) {
      checkEnrollment();
    }
  }, [id, isAuthenticated]);

  const loadCourse = async () => {
    try {
      const response = await coursesApi.getCourseById(id);
      setCourse(response.data.data.course);
    } catch (error) {
      console.error('Ошибка загрузки курса:', error);
      toast.error('Не удалось загрузить курс');
      navigate('/courses');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLessons = async () => {
    try {
      const response = await coursesApi.getLessons(id);
      setLessons(response.data.data.lessons);
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await coursesApi.getCourseProgress(id);
      setProgress(response.data.data.progress);
      setIsEnrolled(true);
    } catch (error) {
      setIsEnrolled(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Войдите, чтобы записаться на курс');
      navigate('/login');
      return;
    }

    try {
      await coursesApi.enrollCourse(id);
      toast.success('Вы успешно записались на курс!');
      setIsEnrolled(true);
      checkEnrollment();
    } catch (error) {
      console.error('Ошибка записи на курс:', error);
      toast.error(error.response?.data?.message || 'Не удалось записаться на курс');
    }
  };

  const getLevelBadge = (level) => {
    const badges = {
      BEGINNER: { text: 'Начинающий', color: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' },
      INTERMEDIATE: { text: 'Средний', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' },
      ADVANCED: { text: 'Продвинутый', color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' },
    };
    return badges[level] || badges.BEGINNER;
  };

  const isLessonCompleted = (lessonId) => {
    return progress?.lessonProgress?.some((lp) => lp.lessonId === lessonId && lp.completed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const levelBadge = getLevelBadge(course.level);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Кнопка назад */}
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад к курсам
        </button>

        <div className="max-w-5xl mx-auto">
          {/* Информация о курсе */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Изображение */}
              <div className="w-full md:w-1/3">
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <BookOpen className="w-16 h-16 text-white" />
                  )}
                </div>
              </div>

              {/* Содержание */}
              <div className="flex-1">
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${levelBadge.color}`}>
                    <Award className="w-3 h-3" />
                    {levelBadge.text}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {course.title}
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {course.description}
                </p>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <BookOpen className="w-5 h-5" />
                    <span>{course._count?.lessons || 0} уроков</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-5 h-5" />
                    <span>{course._count?.progress || 0} студентов</span>
                  </div>
                </div>

                {!isEnrolled ? (
                  <button
                    onClick={handleEnroll}
                    className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                  >
                    Записаться на курс
                  </button>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
                      <CheckCircle className="w-5 h-5" />
                      Вы записаны на этот курс
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Список уроков */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Программа курса
            </h2>

            {lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson, index) => {
                  const completed = isLessonCompleted(lesson.id);
                  const canAccess = isEnrolled;

                  return (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        canAccess
                          ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer'
                          : 'border-gray-200 dark:border-gray-700 opacity-50'
                      } transition`}
                      onClick={() => canAccess && navigate(`/lessons/${lesson.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {lesson.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : !canAccess ? (
                          <Lock className="w-5 h-5 text-gray-400" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Уроки пока не добавлены
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
