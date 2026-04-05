import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Users, Award, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as coursesApi from '../api/courses.api';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';

const LEVEL_CONFIG = {
  BEGINNER:     { label: 'Начинающий',  color: '#4ADE80' },
  INTERMEDIATE: { label: 'Средний',     color: '#FACC15' },
  ADVANCED:     { label: 'Продвинутый', color: '#FF4D00' },
};

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
    if (isAuthenticated) checkEnrollment();
  }, [id, isAuthenticated]);

  const loadCourse = async () => {
    try {
      const response = await coursesApi.getCourseById(id);
      setCourse(response.data.data.course);
    } catch (err) {
      if (err?.status !== 0) { toast.error('Не удалось загрузить курс'); navigate('/courses'); }
    } finally { setIsLoading(false); }
  };

  const loadLessons = async () => {
    try {
      const response = await coursesApi.getLessons(id);
      setLessons(response.data.data.lessons);
    } catch {}
  };

  const checkEnrollment = async () => {
    try {
      const response = await coursesApi.getCourseProgress(id);
      setProgress(response.data.data.progress);
      setIsEnrolled(true);
    } catch { setIsEnrolled(false); }
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
      toast.error(error.response?.data?.message || 'Не удалось записаться на курс');
    }
  };

  const isLessonCompleted = (lessonId) =>
    progress?.lessonProgress?.some(lp => lp.lessonId === lessonId && lp.completed);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  if (!course) return null;

  const level = LEVEL_CONFIG[course.level] || LEVEL_CONFIG.BEGINNER;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 60 }}>
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
        <div className="container mx-auto px-6 max-w-5xl">
          <Breadcrumb items={[
            { label: 'Курсы', to: '/courses' },
            { label: course.title || 'Курс' },
          ]} />
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl space-y-5">
        {/* Course info */}
        <div className="glass p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Thumbnail */}
            <div className="w-full md:w-1/3 shrink-0">
              <div className="aspect-video flex items-center justify-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(255,77,0,0.15), rgba(79,142,247,0.15))', border: '1px solid var(--border-strong)' }}>
                {course.thumbnail
                  ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  : <BookOpen className="w-16 h-16" style={{ color: 'var(--accent)' }} />}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-3.5 h-3.5" style={{ color: level.color }} />
                <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: level.color }}>
                  {level.label}
                </span>
              </div>

              <h1 className="font-display tracking-widest mb-4"
                style={{ fontSize: 'clamp(1.4rem,3vw,2.2rem)', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {course.title?.toUpperCase()}
              </h1>

              <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                {course.description}
              </p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{course._count?.lessons || 0} уроков</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: '#C084FC' }} />
                  <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{course._count?.progress || 0} студентов</span>
                </div>
              </div>

              {!isEnrolled ? (
                <button onClick={handleEnroll}
                  className="font-sans font-semibold text-sm px-8 py-3 transition-opacity"
                  style={{ background: 'var(--accent)', color: '#000', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Записаться на курс
                </button>
              ) : (
                <div className="flex items-center gap-3 p-4"
                  style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderLeft: '3px solid #4ADE80' }}>
                  <CheckCircle className="w-5 h-5 shrink-0" style={{ color: '#4ADE80' }} />
                  <p className="font-sans font-semibold text-sm" style={{ color: '#4ADE80' }}>Вы записаны на этот курс</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="glass p-8">
          <p className="font-mono text-[10px] tracking-widest2 uppercase mb-6" style={{ color: 'var(--text-muted)' }}>
            Программа курса
          </p>

          {lessons.length > 0 ? (
            <div className="space-y-2">
              {lessons.map((lesson, index) => {
                const completed = isLessonCompleted(lesson.id);
                const canAccess = isEnrolled;

                return (
                  <div key={lesson.id}
                    className="flex items-center justify-between p-4 transition-all"
                    style={{
                      background: 'var(--bg-raised)', border: '1px solid var(--border)',
                      opacity: canAccess ? 1 : 0.5,
                      cursor: canAccess ? 'pointer' : 'default',
                      borderLeft: completed ? '3px solid #4ADE80' : '3px solid var(--border)',
                    }}
                    onClick={() => canAccess && navigate(`/lessons/${lesson.id}`)}
                    onMouseEnter={e => { if (canAccess) e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = completed ? 'rgba(74,222,128,0.5)' : 'var(--border)'; e.currentTarget.style.borderLeft = completed ? '3px solid #4ADE80' : '3px solid var(--border)'; }}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 flex items-center justify-center shrink-0 font-display text-sm"
                        style={{
                          background: completed ? 'rgba(74,222,128,0.15)' : 'var(--bg-surface)',
                          border: `1px solid ${completed ? 'rgba(74,222,128,0.4)' : 'var(--border-strong)'}`,
                          color: completed ? '#4ADE80' : 'var(--text-muted)',
                        }}>
                        {index + 1}
                      </div>
                      <h3 className="font-sans font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                        {lesson.title}
                      </h3>
                    </div>
                    <div>
                      {completed
                        ? <CheckCircle className="w-5 h-5" style={{ color: '#4ADE80' }} />
                        : !canAccess
                          ? <Lock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                          : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-sans text-sm" style={{ color: 'var(--text-secondary)' }}>Уроки пока не добавлены</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
