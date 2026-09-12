import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import AnimatedCounter from '../../components/AnimatedCounter';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getArsip } from '../../services/api';

export default function ArsipList() {
  const [arsip, setArsip] = useState([]);
  const [stats, setStats] = useState({
    total_arsip: 0,
    total_surat_masuk: 0,
    total_surat_keluar: 0,
    total_lampiran: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  // Filter state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');

  const fetchArsipData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getArsip({
        search,
        type,
        startDate,
        endDate,
        status,
      });

      if (response && response.success) {
        setArsip(Array.isArray(response.data) ? response.data : []);
        if (response.stats) {
          setStats({
            total_arsip: Number(response.stats.total_arsip) || 0,
            total_surat_masuk: Number(response.stats.total_surat_masuk) || 0,
            total_surat_keluar: Number(response.stats.total_surat_keluar) || 0,
            total_lampiran: Number(response.stats.total_lampiran) || 0,
          });
        }
      } else {
        throw new Error(response?.message || 'Gagal mengambil data arsip.');
      }
    } catch (err) {
      console.error('Error fetching arsip:', err);
      setError(err.message || 'Terjadi kesalahan saat memuat data arsip');
      addToast(err.message || 'Gagal memuat data arsip', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArsipData();
  }, [type, status, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchArsipData();
  };

  const handleResetFilter = () => {
    setSearch('');
    setType('all');
    setStartDate('');
    setEndDate('');
    setStatus('all');
    setTimeout(() => {
      fetchArsipData();
    }, 50);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Layout title="Arsip Digital & Rekapitulasi Laporan">
      {/* Printable Header */}
      <div className="print-only" style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, fontSize: '16pt' }}>REKAPITULASI ARSIP DIGITAL SURAT MASUK & KELUAR</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '10pt', color: '#555' }}>
          Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid no-print animate-fade-in" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-card stat-card" style={{ '--stat-accent': 'var(--primary-gradient)', '--stat-bg': 'var(--primary-light)', '--stat-color': 'var(--primary)' }}>
          <div className="stat-icon-wrapper" style={{ marginBottom: '0.5rem' }}>
            <i className="fa-solid fa-box-archive" />
          </div>
          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              <AnimatedCounter end={stats.total_arsip || 0} duration={800} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Dokumen Terarsip</div>
          </div>
        </div>

        <div className="glass-card stat-card" style={{ '--stat-accent': 'var(--primary-gradient)', '--stat-bg': 'var(--primary-light)', '--stat-color': 'var(--primary)' }}>
          <div className="stat-icon-wrapper" style={{ marginBottom: '0.5rem' }}>
            <i className="fa-solid fa-inbox" />
          </div>
          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              <AnimatedCounter end={stats.total_surat_masuk || 0} duration={800} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Surat Masuk</div>
          </div>
        </div>

        <div className="glass-card stat-card" style={{ '--stat-accent': 'linear-gradient(135deg, #10b981 0%, #059669 100%)', '--stat-bg': '#ecfdf5', '--stat-color': '#10b981' }}>
          <div className="stat-icon-wrapper" style={{ marginBottom: '0.5rem', background: '#ecfdf5', color: '#10b981' }}>
            <i className="fa-solid fa-paper-plane" />
          </div>
          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              <AnimatedCounter end={stats.total_surat_keluar || 0} duration={800} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Surat Keluar</div>
          </div>
        </div>

        <div className="glass-card stat-card" style={{ '--stat-accent': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', '--stat-bg': '#f3e8ff', '--stat-color': '#8b5cf6' }}>
          <div className="stat-icon-wrapper" style={{ marginBottom: '0.5rem', background: '#f3e8ff', color: '#8b5cf6' }}>
            <i className="fa-solid fa-paperclip" />
          </div>
          <div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)' }}>
              <AnimatedCounter end={stats.total_lampiran || 0} duration={800} />
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ber-lampiran File</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card no-print" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: '220px' }}>
            <label className="form-label">
              <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--primary)' }} /> Pencarian Keyword
            </label>
            <input
              type="text"
              placeholder="Cari nomor, perihal, pengirim/tujuan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <label className="form-label">
              <i className="fa-solid fa-folder-closed" style={{ color: 'var(--primary)' }} /> Jenis Dokumen
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-field"
            >
              <option value="all">Semua Jenis</option>
              <option value="surat_masuk">Surat Masuk</option>
              <option value="surat_keluar">Surat Keluar</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '130px' }}>
            <label className="form-label">
              <i className="fa-solid fa-calendar-days" style={{ color: 'var(--primary)' }} /> Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ flex: 1, minWidth: '130px' }}>
            <label className="form-label">
              <i className="fa-solid fa-calendar-days" style={{ color: 'var(--primary)' }} /> Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ flex: 1, minWidth: '140px' }}>
            <label className="form-label">
              <i className="fa-solid fa-list-check" style={{ color: 'var(--primary)' }} /> Status Approval
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">Semua Status</option>
              <option value="Disetujui">✓ Disetujui / Aktif</option>
              <option value="Pending">⏳ Pending</option>
              <option value="Ditolak">✖ Ditolak</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-magnifying-glass" /> Cari
            </button>
            <button type="button" onClick={handleResetFilter} className="btn btn-secondary">
              <i className="fa-solid fa-rotate-left" /> Reset
            </button>
            <button type="button" onClick={handlePrint} className="btn btn-success">
              <i className="fa-solid fa-print" /> Cetak / PDF
            </button>
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="badge badge-danger" style={{ width: '100%', padding: '0.875rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <i className="fa-solid fa-triangle-exclamation" /> {error}
        </div>
      )}

      {/* Table Card */}
      <div className="table-container glass-card">
        {loading ? (
          <LoadingSpinner variant="inline" text="Memuat data arsip…" />
        ) : arsip.length === 0 ? (
          <EmptyState
            icon="fa-box-archive"
            title="Tidak Ada Dokumen Arsip"
            description="Tidak ada dokumen terarsip yang cocok dengan kriteria filter pencarian Anda."
          />
        ) : (
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Jenis</th>
                <th>Nomor Surat</th>
                <th>Tanggal</th>
                <th>Pengirim / Tujuan</th>
                <th>Perihal</th>
                <th>Status</th>
                <th>Lampiran</th>
                <th style={{ textAlign: 'center' }} className="no-print">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {arsip.map((item, index) => (
                <tr key={`${item.jenis_code}-${item.id || index}`}>
                  <td style={{ fontWeight: 600, color: 'var(--text-light)' }}>{index + 1}</td>
                  <td>
                    {item.jenis_code === 'surat_masuk' ? (
                      <span className="badge badge-info"><i className="fa-solid fa-inbox" /> Surat Masuk</span>
                    ) : (
                      <span className="badge badge-purple"><i className="fa-solid fa-paper-plane" /> Surat Keluar</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.nomor_surat || '-'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {formatDate(item.tanggal_surat)}
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.pihak || '-'}</td>
                  <td style={{ maxWidth: '240px' }}>{item.perihal || '-'}</td>
                  <td>
                    {item.status_approval === 'Disetujui' && (
                      <span className="badge badge-success"><i className="fa-solid fa-check" /> Disetujui</span>
                    )}
                    {item.status_approval === 'Pending' && (
                      <span className="badge badge-warning"><i className="fa-solid fa-clock" /> Pending</span>
                    )}
                    {item.status_approval === 'Ditolak' && (
                      <span className="badge badge-danger"><i className="fa-solid fa-xmark" /> Ditolak</span>
                    )}
                    {!['Disetujui', 'Pending', 'Ditolak'].includes(item.status_approval) && (
                      <span className="badge badge-info">{item.status_approval || 'Disetujui'}</span>
                    )}
                  </td>
                  <td>
                    {item.file_url ? (
                      <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="badge badge-info" style={{ textDecoration: 'none' }}>
                        <i className="fa-solid fa-paperclip" /> Lihat File
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-light)' }}>-</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }} className="no-print">
                    <Link to={item.detail_url || '#'} className="btn btn-secondary btn-sm">
                      <i className="fa-solid fa-eye" /> Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
