import { Component } from 'react';

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in child component tree and displays fallback UI instead of blank white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-app-gradient)', color: '#ffffff' }}>
          <div className="glass-card" style={{ maxWidth: '500px', padding: '2rem', textAlign: 'center' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: 'var(--danger)', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem', color: '#ffffff' }}>Terjadi Kesalahan Tampilan</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginBottom: '1.5rem', wordBreak: 'break-word' }}>
              {this.state.error?.message || this.state.error?.toString() || 'Error tidak diketahui'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="btn btn-primary"
            >
              <i className="fa-solid fa-rotate-right" /> Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
