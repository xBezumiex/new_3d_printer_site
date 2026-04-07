import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ChevronLeft, ChevronRight, BookOpen, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as coursesApi from '../api/courses.api';
import toast from 'react-hot-toast';
import Breadcrumb from '../components/Breadcrumb';

export default function LessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Видеоплеер
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isYoutube, setIsYoutube] = useState(false);
  const [videoSrc, setVideoSrc] = useState(null);

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    setIsLoading(true);
    try {
      const res = await coursesApi.getLessonById(id);
      const lessonData = res.data?.data?.lesson;
      setLesson(lessonData);

      // Обрабатываем видео URL
      if (lessonData?.videoUrl) {
        const youtubeMatch = lessonData.videoUrl.match(
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
        );
        if (youtubeMatch) {
          setIsYoutube(true);
          setVideoSrc(`https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0`);
        } else {
          setIsYoutube(false);
          setVideoSrc(lessonData.videoUrl);
        }
      }

      // Загружаем курс и все уроки для навигации
      if (lessonData?.courseId) {
        const [courseRes, lessonsRes] = await Promise.all([
          coursesApi.getCourseById(lessonData.courseId),
          coursesApi.getLessons(lessonData.courseId),
        ]);
        setCourse(courseRes.data?.data?.course);
        setLessons(lessonsRes.data?.data?.lessons || []);

        if (isAuthenticated) {
          const progressRes = await coursesApi.getCourseProgress(lessonData.courseId);
          const prog = progressRes.data?.data?.progress;
          setProgress(prog);
          setCompleted(prog?.lessonProgress?.some(lp => lp.lessonId === id && lp.completed) ?? false);
        }
      }
    } catch (err) {
      if (err?.status !== 0) { toast.error('Не удалось загрузить урок'); navigate('/courses'); }
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!isAuthenticated) { toast.error('Войдите, чтобы отметить урок'); return; }
    if (completed || completing) return;
    setCompleting(true);
    try {
      await coursesApi.completeLesson(id);
      setCompleted(true);
      toast.success('Урок отмечен как пройденный!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ошибка');
    } finally {
      setCompleting(false);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = ratio * duration;
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const currentIdx = lessons.findIndex(l => l.id === id);
  const prevLesson = lessons[currentIdx - 1];
  const nextLesson = lessons[currentIdx + 1];

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }} />
    </div>
  );

  if (!lesson) return null;

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 60 }}>
      {/* Breadcrumb */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
        <div className="container mx-auto px-6 max-w-5xl">
          <Breadcrumb items={[
            { label: 'Курсы', to: '/courses' },
            ...(course ? [{ label: course.title, to: `/courses/${lesson.courseId}` }] : []),
            { label: lesson.title || 'Урок' },
          ]} />
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl space-y-5">
        {/* Заголовок и прогресс */}
        <div className="glass p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: 'var(--accent)' }}>
              {course?.title}
            </p>
            <h1 className="font-display tracking-widest" style={{ fontSize: 'clamp(1.2rem,3vw,1.8rem)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {lesson.title?.toUpperCase()}
            </h1>
          </div>
          <button
            onClick={handleComplete}
            disabled={completed || completing}
            className="flex items-center gap-2 font-sans font-semibold text-sm px-5 py-2.5 shrink-0 transition-all"
            style={{
              background: completed ? 'rgba(74,222,128,0.12)' : 'var(--accent)',
              color: completed ? '#4ADE80' : '#000',
              border: completed ? '1px solid rgba(74,222,128,0.3)' : 'none',
              cursor: completed ? 'default' : completing ? 'wait' : 'pointer',
              opacity: completing ? 0.7 : 1,
            }}>
            <CheckCircle className="w-4 h-4" />
            {completed ? 'Пройдено' : completing ? 'Сохраняем...' : 'Отметить пройденным'}
          </button>
        </div>

        {/* Видеоплеер */}
        {videoSrc && (
          <div className="glass overflow-hidden">
            {isYoutube ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={videoSrc}
                  title={lesson.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div style={{ background: '#000', position: 'relative' }}>
                <video
                  ref={videoRef}
                  src={videoSrc}
                  style={{ width: '100%', maxHeight: '480px', display: 'block' }}
                  onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                  onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onEnded={() => { setPlaying(false); if (!completed) handleComplete(); }}
                />
                {/* Кастомные контролы */}
                <div style={{ background: 'rgba(0,0,0,0.85)', padding: '10px 16px' }}>
                  {/* Прогресс-бар */}
                  <div
                    onClick={handleSeek}
                    style={{ height: 4, background: 'rgba(255,255,255,0.15)', cursor: 'pointer', marginBottom: 10, position: 'relative' }}>
                    <div style={{ height: '100%', background: 'var(--accent)', width: `${progressPct}%`, transition: 'width 0.2s' }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <button onClick={toggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    <button onClick={handleFullscreen} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Содержание урока */}
        {lesson.content && (
          <div className="glass p-8">
            <p className="font-mono text-[10px] tracking-widest uppercase mb-5" style={{ color: 'var(--text-muted)' }}>
              Содержание урока
            </p>
            <div className="font-sans text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {lesson.content}
            </div>
          </div>
        )}

        {/* Навигация между уроками */}
        <div className="flex items-center justify-between gap-4">
          {prevLesson ? (
            <Link to={`/lessons/${prevLesson.id}`}
              className="flex items-center gap-2 font-sans text-sm px-4 py-3 flex-1 transition-all"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}>
              <ChevronLeft className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
              <div className="min-w-0">
                <p className="font-mono text-[10px] tracking-wider uppercase mb-0.5" style={{ color: 'var(--text-muted)' }}>Предыдущий</p>
                <p className="truncate">{prevLesson.title}</p>
              </div>
            </Link>
          ) : <div className="flex-1" />}

          {nextLesson ? (
            <Link to={`/lessons/${nextLesson.id}`}
              className="flex items-center gap-2 font-sans text-sm px-4 py-3 flex-1 justify-end transition-all"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', textDecoration: 'none', textAlign: 'right' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}>
              <div className="min-w-0">
                <p className="font-mono text-[10px] tracking-wider uppercase mb-0.5" style={{ color: 'var(--text-muted)' }}>Следующий</p>
                <p className="truncate">{nextLesson.title}</p>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
            </Link>
          ) : (
            <Link to={lesson.courseId ? `/courses/${lesson.courseId}` : '/courses'}
              className="flex items-center gap-2 font-sans text-sm px-4 py-3 flex-1 justify-end transition-all"
              style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ADE80', textDecoration: 'none', textAlign: 'right' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,222,128,0.08)'}>
              <div className="min-w-0">
                <p className="font-mono text-[10px] tracking-wider uppercase mb-0.5" style={{ color: 'rgba(74,222,128,0.6)' }}>Курс завершён</p>
                <p className="truncate">Вернуться к курсу</p>
              </div>
              <BookOpen className="w-4 h-4 shrink-0" />
            </Link>
          )}
        </div>

        {/* Список уроков */}
        {lessons.length > 1 && (
          <div className="glass p-6">
            <p className="font-mono text-[10px] tracking-widest uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
              Все уроки курса
            </p>
            <div className="space-y-1.5">
              {lessons.map((l, idx) => {
                const isActive = l.id === id;
                const isDone = progress?.lessonProgress?.some(lp => lp.lessonId === l.id && lp.completed);
                return (
                  <div
                    key={l.id}
                    onClick={() => navigate(`/lessons/${l.id}`)}
                    className="flex items-center gap-3 p-3 cursor-pointer transition-all"
                    style={{
                      background: isActive ? 'rgba(255,77,0,0.08)' : 'var(--bg-raised)',
                      border: `1px solid ${isActive ? 'rgba(255,77,0,0.3)' : 'var(--border)'}`,
                      borderLeft: `3px solid ${isDone ? '#4ADE80' : isActive ? 'var(--accent)' : 'transparent'}`,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <div className="w-6 h-6 flex items-center justify-center shrink-0 font-display text-xs"
                      style={{
                        background: isDone ? 'rgba(74,222,128,0.15)' : isActive ? 'rgba(255,77,0,0.15)' : 'var(--bg-surface)',
                        border: `1px solid ${isDone ? 'rgba(74,222,128,0.4)' : isActive ? 'rgba(255,77,0,0.4)' : 'var(--border-strong)'}`,
                        color: isDone ? '#4ADE80' : isActive ? 'var(--accent)' : 'var(--text-muted)',
                      }}>
                      {isDone ? <CheckCircle className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span className="font-sans text-sm" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {l.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
