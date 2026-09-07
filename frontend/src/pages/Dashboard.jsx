import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getSuratMasuk, getSuratKeluar, getDisposisi } from '../services/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    suratMasukCount: 0,
    suratKeluarCount: 0,
    suratKeluarPending: 0,
    suratKeluarApproved: 0,
    disposisiCount: 0,
    disposisiPending: 0,
  });
  const [recentSuratMasuk, setRecentSuratMasuk] = useState([]);
  const [recentSuratKeluar, setRecentSuratKeluar] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(storedUser));

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [masukRes, keluarRes, dispRes] = await Promise.all([
          getSuratMasuk(),
          getSuratKeluar(),
          getDisposisi(),
        ]);

        const masukData = masukRes.success ? masukRes.data || [] : [];
        const keluarData = keluarRes.success ? keluarRes.data || [] : [];
        const dispData = dispRes.success ? dispRes.data || [] : [];

        setStats({
          suratMasukCount: masukData.length,
          suratKeluarCount: keluarData.length,
          suratKeluarPending: keluarData.filter((s) => s.status_approval === 'Pending').length,
          suratKeluarApproved: keluarData.filter((s) => s.status_approval === 'Disetujui').length,
          disposisiCount: dispData.length,
          disposisiPending: dispData.filter((d) => d.status === 'Menunggu').length,
        });

        setRecentSuratMasuk(masukData.slice(0, 5));
        setRecentSuratKeluar(keluarData.slice(0, 5));
      } catch (err) {
        console.error('Gagal memuat statistik dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getApprovalBadge = (status) => {
    const st = (status || '').toLowerCase();
    if (st === 'disetujui') return <span style={{ ...styles.badge, ...styles.badgeApproved }}>✓ Disetujui</span>;
    if (st === 'ditolak') return <span style={{ ...styles.badge, ...styles.badgeRejected }}>✖ Ditolak</span>;
    return <span style={{ ...styles.badge, ...styles.badgePending }}>⏳ Pending</span>;
  };

  if (!user) return null;

  return (
    <Layout title="Dashboard Overview">
      <div style={styles.container}>
        {/* Welcome Banner */}
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeText}>
            <h2 style={styles.welcomeTitle}>Selamat Datang kembali, {user.full_name}! 👋</h2>
            <p style={styles.welcomeSub}>
              Sistem Pengelolaan Surat Masuk, Surat Keluar, dan Disposisi Instansi.
            </p>
          </div>
          <div style={styles.userBadgeBox}>
            <span style={styles.userBadgeRole}>{user.role || 'Staff'}</span>
            {user.jabatan && <span style={styles.userBadgeJabatan}>{user.jabatan}</span>}
          </div>
        </div>

        {/* Quick Action Bar */}
        <div style={styles.quickActions}>
          <Link to="/surat-masuk/tambah" style={styles.quickBtnPrimary}>
            📥 + Tambah Surat Masuk
          </Link>
          <Link to="/surat-keluar/tambah" style={styles.quickBtnSecondary}>
            📤 + Buat Surat Keluar
          </Link>
          <Link to="/disposisi/tambah" style={styles.quickBtnInfo}>
            📋 + Buat Disposisi
          </Link>
        </div>

        {/* Stat Cards Grid */}
        <div style={styles.statsGrid}>
          {/* Card 1: Surat Masuk */}
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statIconBlue}>📥</span>
              <span style={styles.statLabel}>Surat Masuk</span>
            </div>
            <div style={styles.statValue}>{loading ? '…' : stats.suratMasukCount}</div>
            <div style={styles.statFooter}>Total seluruh surat masuk terarsip</div>
          </div>

          {/* Card 2: Surat Keluar */}
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statIconGreen}>📤</span>
              <span style={styles.statLabel}>Surat Keluar</span>
            </div>
            <div style={styles.statValue}>{loading ? '…' : stats.suratKeluarCount}</div>
            <div style={styles.statFooter}>
              <span style={{ color: '#d97706', fontWeight: '600' }}>
                ⏳ {stats.suratKeluarPending} Pending
              </span>{' '}
              •{' '}
              <span style={{ color: '#16a34a', fontWeight: '600' }}>
                ✓ {stats.suratKeluarApproved} Disetujui
              </span>
            </div>
          </div>

          {/* Card 3: Disposisi Surat */}
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statIconPurple}>📋</span>
              <span style={styles.statLabel}>Disposisi Surat</span>
            </div>
            <div style={styles.statValue}>{loading ? '…' : stats.disposisiCount}</div>
            <div style={styles.statFooter}>
              <span style={{ color: '#d97706', fontWeight: '600' }}>
                ⏳ {stats.disposisiPending} Menunggu Tindakan
              </span>
            </div>
          </div>
        </div>

        {/* Activity Section Grid (2 Columns) */}
        <div style={styles.activityGrid}>
          {/* Recent Surat Masuk */}
          <div style={styles.activityCard}>
            <div style={styles.activityHeader}>
              <h3 style={styles.activityTitle}>📥 Surat Masuk Terbaru</h3>
              <Link to="/surat-masuk" style={styles.viewAllLink}>
                Lihat Semua →
              </Link>
            </div>
            {loading ? (
              <div style={styles.loadingText}>Memuat data…</div>
            ) : recentSuratMasuk.length === 0 ? (
              <div style={styles.emptyText}>Belum ada data surat masuk.</div>
            ) : (
              <div style={styles.listGroup}>
                {recentSuratMasuk.map((item) => (
                  <div key={item.id} style={styles.listItem}>
                    <div style={{ flex: 1 }}>
                      <Link to={`/surat-masuk/${item.id}`} style={styles.itemTitle}>
                        {item.nomor_surat}
                      </Link>
                      <div style={styles.itemSub}>{item.perihal}</div>
                      <div style={styles.itemMeta}>Asal: {item.asal_surat}</div>
                    </div>
                    <span style={styles.itemDate}>{formatDate(item.tanggal_surat)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Surat Keluar */}
          <div style={styles.activityCard}>
            <div style={styles.activityHeader}>
              <h3 style={styles.activityTitle}>📤 Surat Keluar Terbaru</h3>
              <Link to="/surat-keluar" style={styles.viewAllLink}>
                Lihat Semua →
              </Link>
            </div>
            {loading ? (
              <div style={styles.loadingText}>Memuat data…</div>
            ) : recentSuratKeluar.length === 0 ? (
              <div style={styles.emptyText}>Belum ada data surat keluar.</div>
            ) : (
              <div style={styles.listGroup}>
                {recentSuratKeluar.map((item) => (
                  <div key={item.id} style={styles.listItem}>
                    <div style={{ flex: 1 }}>
                      <Link to={`/surat-keluar/${item.id}`} style={styles.itemTitle}>
                        {item.nomor_surat || 'Draft Surat Keluar'}
                      </Link>
                      <div style={styles.itemSub}>{item.perihal}</div>
                      <div style={styles.itemMeta}>Tujuan: {item.tujuan_surat}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      {getApprovalBadge(item.status_approval)}
                      <span style={styles.itemDate}>{formatDate(item.tanggal_surat)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem 2rem',
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  welcomeText: { display: 'flex', flexDirection: 'column', gap: '4px' },
  welcomeTitle: { fontSize: '1.35rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  welcomeSub: { fontSize: '0.875rem', color: '#64748b', margin: 0 },
  userBadgeBox: { display: 'flex', gap: '6px', alignItems: 'center' },
  userBadgeRole: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userBadgeJabatan: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  quickActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  quickBtnPrimary: {
    padding: '0.65rem 1.25rem',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  quickBtnSecondary: {
    padding: '0.65rem 1.25rem',
    backgroundColor: '#059669',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  quickBtnInfo: {
    padding: '0.65rem 1.25rem',
    backgroundColor: '#7c3aed',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.25rem',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  statHeader: { display: 'flex', alignItems: 'center', gap: '8px' },
  statIconBlue: {
    fontSize: '1.2rem',
    backgroundColor: '#eff6ff',
    padding: '6px',
    borderRadius: '8px',
  },
  statIconGreen: {
    fontSize: '1.2rem',
    backgroundColor: '#ecfdf5',
    padding: '6px',
    borderRadius: '8px',
  },
  statIconPurple: {
    fontSize: '1.2rem',
    backgroundColor: '#f5f3ff',
    padding: '6px',
    borderRadius: '8px',
  },
  statLabel: { fontSize: '0.85rem', fontWeight: '600', color: '#64748b' },
  statValue: { fontSize: '2rem', fontWeight: '800', color: '#1e293b' },
  statFooter: { fontSize: '0.75rem', color: '#94a3b8' },
  activityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '1.5rem',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '0.75rem',
  },
  activityTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  viewAllLink: { color: '#2563eb', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '600' },
  loadingText: { textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' },
  emptyText: { textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' },
  listGroup: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  listItem: {
    padding: '0.75rem',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  itemTitle: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#1e293b',
    textDecoration: 'none',
  },
  itemSub: { fontSize: '0.8rem', color: '#475569', marginTop: '2px' },
  itemMeta: { fontSize: '0.75rem', color: '#64748b', marginTop: '2px' },
  itemDate: { fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' },
  badge: {
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  badgePending: { backgroundColor: '#fef9c3', color: '#a16207' },
  badgeApproved: { backgroundColor: '#dcfce7', color: '#15803d' },
  badgeRejected: { backgroundColor: '#fee2e2', color: '#b91c1c' },
};
