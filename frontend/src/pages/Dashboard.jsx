import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { LoadingSpinner, SkeletonStatCards } from '../components/LoadingSpinner';
import AnimatedCounter from '../components/AnimatedCounter';
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
    if (st === 'disetujui') return <span className="badge badge-success"><i className="fa-solid fa-check" /> Disetujui</span>;
    if (st === 'ditolak') return <span className="badge badge-danger"><i className="fa-solid fa-xmark" /> Ditolak</span>;
    return <span className="badge badge-warning"><i className="fa-solid fa-clock" /> Pending</span>;
  };

  if (!user) return null;

  return (
    <Layout title="Dashboard Overview">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Hero Welcome Card */}
        <div className="glass-card animate-fade-in" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', zIndex: 1 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>
              Selamat Datang kembali, {user.full_name}! 👋
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Sistem Pengelolaan Surat Masuk, Surat Keluar, dan Disposisi Instansi.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', zIndex: 1 }}>
            <span className="badge badge-info" style={{ fontSize: '0.825rem', padding: '0.4rem 0.875rem' }}>
              {user.role || 'Staff'}
            </span>
            {user.jabatan && (
              <span className="badge badge-warning" style={{ fontSize: '0.825rem', padding: '0.4rem 0.875rem' }}>
                {user.jabatan}
              </span>
            )}
          </div>
        </div>

        {/* Quick Action Bar */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/surat-masuk/tambah" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
            <i className="fa-solid fa-inbox" /> + Tambah Surat Masuk
          </Link>
          <Link to="/surat-keluar/tambah" className="btn btn-success" style={{ padding: '0.75rem 1.25rem' }}>
            <i className="fa-solid fa-paper-plane" /> + Buat Surat Keluar
          </Link>
          <Link to="/disposisi/tambah" className="btn btn-orange" style={{ padding: '0.75rem 1.25rem' }}>
            <i className="fa-solid fa-clipboard-list" /> + Buat Disposisi
          </Link>
        </div>

        {/* Stat Cards Grid */}
        {loading ? (
          <SkeletonStatCards count={3} />
        ) : (
          <div className="stats-grid animate-fade-in animate-delay-1">
            {/* Card 1: Surat Masuk */}
            <div className="glass-card stat-card" style={{ '--stat-accent': 'var(--primary-gradient)', '--stat-bg': 'var(--primary-light)', '--stat-color': 'var(--primary)' }}>
              <div>
                <div className="stat-icon-wrapper" style={{ marginBottom: '0.75rem' }}>
                  <i className="fa-solid fa-inbox" />
                </div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>Surat Masuk</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>
                  <AnimatedCounter end={stats.suratMasukCount} duration={800} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Total seluruh surat masuk terarsip</div>
              </div>
            </div>

            {/* Card 2: Surat Keluar */}
            <div className="glass-card stat-card" style={{ '--stat-accent': 'linear-gradient(135deg, #10b981 0%, #059669 100%)', '--stat-bg': '#ecfdf5', '--stat-color': '#10b981' }}>
              <div>
                <div className="stat-icon-wrapper" style={{ marginBottom: '0.75rem' }}>
                  <i className="fa-solid fa-paper-plane" />
                </div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>Surat Keluar</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>
                  <AnimatedCounter end={stats.suratKeluarCount} duration={800} />
                </div>
                <div style={{ fontSize: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--warning)', fontWeight: 700 }}>
                    <i className="fa-solid fa-clock" /> <AnimatedCounter end={stats.suratKeluarPending} duration={600} /> Pending
                  </span>
                  <span>•</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>
                    <i className="fa-solid fa-check" /> <AnimatedCounter end={stats.suratKeluarApproved} duration={600} /> Disetujui
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Disposisi Surat */}
            <div className="glass-card stat-card" style={{ '--stat-accent': 'var(--accent-orange-gradient)', '--stat-bg': 'var(--accent-orange-light)', '--stat-color': 'var(--accent-orange)' }}>
              <div>
                <div className="stat-icon-wrapper" style={{ marginBottom: '0.75rem' }}>
                  <i className="fa-solid fa-clipboard-list" />
                </div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>Disposisi Surat</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>
                  <AnimatedCounter end={stats.disposisiCount} duration={800} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 700 }}>
                  <i className="fa-solid fa-clock" /> <AnimatedCounter end={stats.disposisiPending} duration={600} /> Menunggu Tindakan
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Section Grid (2 Columns) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }} className="animate-fade-in animate-delay-2">
          {/* Recent Surat Masuk */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-inbox" style={{ color: 'var(--primary)' }} /> Surat Masuk Terbaru
              </h3>
              <Link to="/surat-masuk" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
                Lihat Semua →
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner variant="inline" text="Memuat surat masuk…" />
            ) : recentSuratMasuk.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Belum ada data surat masuk.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentSuratMasuk.map((item) => (
                  <div key={item.id} style={{ padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.75)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/surat-masuk/${item.id}`} style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', textDecoration: 'none', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.nomor_surat}
                      </Link>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.perihal}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>Asal: {item.asal_surat}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', whiteSpace: 'nowrap', fontWeight: 600 }}>{formatDate(item.tanggal_surat)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Surat Keluar */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fa-solid fa-paper-plane" style={{ color: 'var(--success)' }} /> Surat Keluar Terbaru
              </h3>
              <Link to="/surat-keluar" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
                Lihat Semua →
              </Link>
            </div>

            {loading ? (
              <LoadingSpinner variant="inline" text="Memuat surat keluar…" />
            ) : recentSuratKeluar.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Belum ada data surat keluar.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentSuratKeluar.map((item) => (
                  <div key={item.id} style={{ padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.75)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/surat-keluar/${item.id}`} style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', textDecoration: 'none', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.nomor_surat || 'Draft Surat Keluar'}
                      </Link>
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.perihal}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>Tujuan: {item.tujuan_surat}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      {getApprovalBadge(item.status_approval)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', whiteSpace: 'nowrap', fontWeight: 600 }}>{formatDate(item.tanggal_surat)}</span>
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
