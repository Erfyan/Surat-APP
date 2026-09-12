import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';

/**
 * Layout utama dengan sidebar navigasi (desktop only), glassmorphism header,
 * dan bottom tab bar animasi bundar untuk native mobile UX.
 */
export default function Layout({ children, title }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <i className="fa-solid fa-house" /> },
    { path: '/surat-masuk', label: 'Surat Masuk', icon: <i className="fa-solid fa-inbox" /> },
    { path: '/disposisi', label: 'Disposisi', icon: <i className="fa-solid fa-clipboard-list" /> },
    { path: '/surat-keluar', label: 'Surat Keluar', icon: <i className="fa-solid fa-paper-plane" /> },
    { path: '/arsip', label: 'Arsip & Laporan', icon: <i className="fa-solid fa-box-archive" /> },
  ];

  const mobileNavItems = [
    { path: '/', label: 'Beranda', icon: 'fa-solid fa-house' },
    { path: '/surat-masuk', label: 'Masuk', icon: 'fa-solid fa-inbox' },
    { path: '/disposisi', label: 'Tugas', icon: 'fa-solid fa-clipboard-list' },
    { path: '/surat-keluar', label: 'Keluar', icon: 'fa-solid fa-paper-plane' },
    { path: '/arsip', label: 'Arsip', icon: 'fa-solid fa-box-archive' },
  ];

  return (
    <div className="app-container">
      {/* Desktop Sidebar Navigation (hidden on mobile) */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand-icon">
            <i className="fa-solid fa-envelope-open-text" />
          </div>
          <div>
            <div className="sidebar-brand-title">Surat App</div>
            <div className="sidebar-brand-sub">Sistem Persuratan Digital</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-label">Menu Utama</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <div className="user-avatar">
              {user.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.full_name || 'Pengguna'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'capitalize' }}>
                {user.role || 'Staff'} {user.jabatan ? `• ${user.jabatan}` : ''}
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ width: '100%' }} data-testid="logout-btn">
            <i className="fa-solid fa-right-from-bracket" /> Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="main-content">
        {/* Top Navbar */}
        <header className="top-header glass-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }} className="title-gradient">{title}</h1>
          </div>

          {/* Mobile: show user avatar + logout in header */}
          <div className="mobile-header-actions">
            <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
              {user.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '0.35rem' }} aria-label="Logout">
              <i className="fa-solid fa-right-from-bracket" />
            </button>
          </div>

          {/* Desktop: empty right side (user info is in sidebar) */}
          <div className="desktop-header-actions" />
        </header>

        {/* Content Body */}
        <main className="content-body animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar — Premium Circular Animation */}
      <nav className="mobile-bottom-nav no-print">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon-wrap">
              <span className="mobile-nav-ring" />
              <i className={item.icon} />
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
