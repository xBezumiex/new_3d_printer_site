import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 flex-wrap" style={{ marginBottom: 20 }}>
      <Link
        to="/"
        className="flex items-center gap-1 transition-colors"
        style={{ color: 'var(--text-muted)', fontSize: 13 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Главная</span>
      </Link>

      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 shrink-0" style={{ color: 'var(--text-muted)' }} />
          {item.to ? (
            <Link
              to={item.to}
              className="font-mono text-xs tracking-wider transition-colors"
              style={{ color: 'var(--text-secondary)', fontSize: 12 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-mono text-xs font-medium truncate" style={{ color: 'var(--text-primary)', fontSize: 12, maxWidth: 200 }}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
