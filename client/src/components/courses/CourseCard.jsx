import { Link } from 'react-router-dom';
import { BookOpen, Users, Award } from 'lucide-react';

const LEVEL_CONFIG = {
  BEGINNER:     { label: 'Начинающий',  color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)' },
  INTERMEDIATE: { label: 'Средний',     color: '#FACC15', bg: 'rgba(250,204,21,0.1)',  border: 'rgba(250,204,21,0.25)' },
  ADVANCED:     { label: 'Продвинутый', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
};

export default function CourseCard({ course }) {
  const lvl = LEVEL_CONFIG[course.level] || LEVEL_CONFIG.BEGINNER;

  return (
    <Link
      to={`/courses/${course.id}`}
      className="glass glass-hover grad-border"
      style={{ display: 'block', borderRadius: 4, overflow: 'hidden', textDecoration: 'none', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--glass-shadow)'; }}
    >
      {/* Thumbnail */}
      <div style={{ height: 180, background: 'linear-gradient(135deg,rgba(255,77,0,0.15),rgba(79,142,247,0.15))', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="w-14 h-14" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,16,0.6) 0%, transparent 60%)' }} />
      </div>

      {/* Content */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ marginBottom: 10 }}>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs px-2 py-1"
            style={{ background: lvl.bg, border: `1px solid ${lvl.border}`, color: lvl.color }}>
            <Award className="w-3 h-3" />
            {lvl.label}
          </span>
        </div>

        <h3 className="font-sans font-semibold text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-primary)', lineHeight: 1.45 }}>
          {course.title}
        </h3>
        <p className="font-sans text-xs leading-relaxed line-clamp-3 mb-4" style={{ color: 'var(--text-secondary)' }}>
          {course.description}
        </p>

        <div className="flex items-center gap-4 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{course._count?.lessons || 0} уроков</span>
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{course._count?.progress || 0} студентов</span>
        </div>

        {course.progress && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between font-mono text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              <span>Прогресс</span>
              <span style={{ color: 'var(--accent)' }}>{course.progress.completedLessons}/{course.progress.totalLessons}</span>
            </div>
            <div style={{ height: 3, background: 'var(--border-strong)', borderRadius: 2 }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'var(--accent)',
                width: `${(course.progress.completedLessons / course.progress.totalLessons) * 100}%`,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
