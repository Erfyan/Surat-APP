/**
 * LoadingSpinner — Premium loading UX component
 * 
 * Variants:
 *  - "page"     → Full content area loader with animated rings + text
 *  - "inline"   → Compact inline spinner for sections (tables, lists)
 *  - "skeleton" → Shimmer skeleton cards (for dashboard stats, tables)
 *  - "button"   → Tiny spinner for button loading states
 */

export function LoadingSpinner({ variant = 'page', text = 'Memuat data...', rows = 3 }) {
  if (variant === 'button') {
    return <span className="loading-btn-spinner" aria-label="Loading" />;
  }

  if (variant === 'skeleton') {
    return (
      <div className="skeleton-container">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="skeleton-line skeleton-line-lg" />
            <div className="skeleton-line skeleton-line-md" />
            <div className="skeleton-line skeleton-line-sm" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="loading-inline glass-card">
        <div className="loading-ring-small">
          <div className="loading-ring-arc" />
        </div>
        <span className="loading-text-inline">{text}</span>
      </div>
    );
  }

  // Default: "page" variant — full page loading experience
  return (
    <div className="loading-page">
      <div className="loading-content">
        {/* Animated orbital rings */}
        <div className="loading-rings">
          <div className="loading-ring loading-ring-outer" />
          <div className="loading-ring loading-ring-middle" />
          <div className="loading-ring loading-ring-inner" />
          <div className="loading-center-icon">
            <i className="fa-solid fa-envelope-open-text" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="loading-progress-track">
          <div className="loading-progress-bar" />
        </div>

        {/* Text */}
        <p className="loading-text">{text}</p>
        <div className="loading-dots">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton row for tables */
export function SkeletonTableRows({ cols = 5, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} className="skeleton-table-row" style={{ animationDelay: `${rowIdx * 0.06}s` }}>
          {Array.from({ length: cols }).map((_, colIdx) => (
            <td key={colIdx}>
              <div className="skeleton-line skeleton-line-table" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Skeleton stat cards for Dashboard */
export function SkeletonStatCards({ count = 3 }) {
  return (
    <div className="stats-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card stat-card skeleton-stat" style={{ animationDelay: `${i * 0.12}s` }}>
          <div>
            <div className="skeleton-circle" />
            <div className="skeleton-line skeleton-line-sm" style={{ marginTop: '0.75rem' }} />
            <div className="skeleton-line skeleton-line-lg" style={{ marginTop: '0.5rem', height: '2rem' }} />
            <div className="skeleton-line skeleton-line-md" style={{ marginTop: '0.5rem' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default LoadingSpinner;
