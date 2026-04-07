import { Component } from 'react';

// Перехватывает ошибки загрузки lazy-chunk при отсутствии интернета
export default class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    const msg = error?.message || '';
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('dynamically imported module')
    ) {
      return { hasError: true };
    }
    return null;
  }

  componentDidMount() {
    // Когда появляется интернет — перезагружаем страницу
    window.addEventListener('online', this.handleOnline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
  }

  handleOnline = () => {
    if (this.state.hasError) {
      window.location.reload();
    }
  };

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            background: 'rgba(255,77,0,0.12)',
            border: '1px solid rgba(255,77,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            fontSize: 24,
          }}
        >
          📡
        </div>
        <h2
          style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 28,
            letterSpacing: '0.1em',
            color: 'var(--text-primary)',
            marginBottom: 10,
          }}
        >
          НЕТ ПОДКЛЮЧЕНИЯ
        </h2>
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 14,
            color: 'var(--text-secondary)',
            maxWidth: 320,
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          Страница не загрузилась из-за отсутствия интернета.
          Проверьте соединение и попробуйте снова.
        </p>
        <button
          onClick={this.handleRetry}
          style={{
            padding: '12px 32px',
            background: 'var(--accent)',
            color: '#000',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Обновить страницу
        </button>
        <p
          style={{
            marginTop: 16,
            fontFamily: 'DM Mono, monospace',
            fontSize: 11,
            color: 'var(--text-muted)',
          }}
        >
          Или подождите — страница обновится автоматически при восстановлении связи
        </p>
      </div>
    );
  }
}
