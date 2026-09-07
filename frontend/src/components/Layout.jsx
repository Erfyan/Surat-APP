import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';

/**
 * Layout utama dengan sidebar navigasi responsif dan indikator rute aktif.
 */
export default function Layout({ children, title }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/surat-masuk', label: 'Surat Masuk', icon: '📥' },
    { path: '/disposisi', label: 'Disposisi', icon: '📋' },
    { path: '/surat-keluar', label: 'Surat Keluar', icon: '📤' },
    { path: '/arsip', label: 'Arsip & Laporan', icon: '📁' },
  ];

  return (
    <div style={styles.wrapper}>
      {/* Overlay untuk Mobile */}
      {mobileOpen && (
        <div 
          style={styles.mobileOverlay} 
          onClick={() => setMobileOpen(false)}
          data-testid="mobile-overlay"
        />
      )}

      {/* Sidebar Navigation */}
      <aside style={{ ...styles.sidebar, ...(mobileOpen ? styles.sidebarOpen : {}) }}>
        <div style={styles.brand}>
          <div style={styles.brandBadge}>📬</div>
          <div>
            <div style={styles.brandText}>Surat App</div>
            <div style={styles.brandSub}>Sistem Persuratan Digital</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
              onClick={() => setMobileOpen(false)}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={styles.userName}>{user.full_name || 'Pengguna'}</div>
              <div style={styles.userRole}>{user.role || 'Staff'} {user.jabatan ? `• ${user.jabatan}` : ''}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} data-testid="logout-btn">
            🚪 Keluar
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main style={styles.main}>
        <header style={styles.header}>
          <button 
            style={styles.hamburgerBtn} 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation"
          >
            ☰
          </button>
          <h1 style={styles.pageTitle}>{title}</h1>
        </header>

        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#0f172a',
    color: '#cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 40,
    transition: 'transform 0.25s ease-in-out',
    boxShadow: '4px 0 15px rgba(0, 0, 0, 0.05)',
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    zIndex: 35,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '1.5rem 1.25rem',
    borderBottom: '1px solid #1e293b',
  },
  brandBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
  },
  brandText: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: '-0.02em',
  },
  brandSub: {
    fontSize: '0.725rem',
    color: '#64748b',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem 0.75rem',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0.75rem 1rem',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    borderRadius: '8px',
    transition: 'all 0.15s ease',
  },
  navItemActive: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    fontWeight: '600',
    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
  },
  navIcon: {
    fontSize: '1.1rem',
  },
  userSection: {
    padding: '1rem 1.25rem',
    borderTop: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    backgroundColor: '#0b1120',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.95rem',
    flexShrink: 0,
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#f8fafc',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '0.725rem',
    color: '#64748b',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    width: '100%',
    padding: '0.55rem',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.825rem',
    fontWeight: '600',
    transition: 'all 0.15s ease',
  },
  main: {
    flex: 1,
    marginLeft: '260px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  header: {
    padding: '1.25rem 2rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  hamburgerBtn: {
    display: 'none',
    fontSize: '1.25rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#334155',
  },
  pageTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  content: {
    padding: '2rem',
    flex: 1,
  },
};
