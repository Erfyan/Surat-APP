import { useNavigate, Link } from 'react-router-dom';

/**
 * Layout utama dengan sidebar navigasi.
 * Dipakai di semua halaman dalam aplikasi.
 */
export default function Layout({ children, title }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>📬</span>
          <span style={styles.brandText}>Surat App</span>
        </div>

        <nav style={styles.nav}>
          <Link to="/" style={styles.navItem}>🏠 Dashboard</Link>
          <Link to="/surat-masuk" style={styles.navItem}>📥 Surat Masuk</Link>
          <Link to="/disposisi" style={styles.navItem}>📋 Disposisi</Link>
          <Link to="/surat-keluar" style={styles.navItem}>📤 Surat Keluar</Link>
        </nav>


        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user.full_name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div style={styles.userName}>{user.full_name || 'User'}</div>
              <div style={styles.userRole}>{user.role || 'Staff'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Keluar</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <header style={styles.header}>
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
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    backgroundColor: '#1e293b',
    color: '#cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '1.5rem 1.25rem',
    borderBottom: '1px solid #334155',
  },
  brandIcon: { fontSize: '1.5rem' },
  brandText: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#f1f5f9',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem 0',
    gap: '4px',
  },
  navItem: {
    display: 'block',
    padding: '0.65rem 1.25rem',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.9rem',
    borderRadius: '0',
    transition: 'all 0.15s',
  },
  userSection: {
    padding: '1rem 1.25rem',
    borderTop: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#f1f5f9',
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'capitalize',
  },
  logoutBtn: {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.15s',
  },
  main: {
    flex: 1,
    marginLeft: '240px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '1.25rem 2rem',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  pageTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
  },
  content: {
    padding: '2rem',
    flex: 1,
  },
};
