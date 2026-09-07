import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
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

  // Filter state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');

  const fetchArsipData = async () => {
    setLoading(true);
    try {
      const response = await getArsip({
        search,
        type,
        startDate,
        endDate,
        status,
      });

      if (response.success) {
        setArsip(response.data || []);
        if (response.stats) {
          setStats(response.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching arsip:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArsipData();
  }, [type, status]);

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

  return (
    <Layout title="📁 Arsip Digital & Rekapitulasi Laporan">
      {/* Styles khusus untuk Print / Cetak PDF */}
      <style>
        {`
          @media print {
            aside, header, .no-print, button, .filter-card {
              display: none !important;
            }
            main {
              margin-left: 0 !important;
              padding: 0 !important;
            }
            .print-header {
              display: block !important;
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .print-table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            .print-table th, .print-table td {
              border: 1px solid #000 !important;
              padding: 6px 10px !important;
              font-size: 11pt !important;
            }
          }
          .print-header { display: none; }
        `}
      </style>

      {/* Header khusus Print */}
      <div className="print-header">
        <h2 style={{ margin: 0 }}>REKAPITULASI ARSIP DIGITAL SURAT MASUK & KELUAR</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#555' }}>
          Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid} className="no-print">
        <div style={styles.statCard}>
          <div style={{ fontSize: '1.8rem' }}>📦</div>
          <div>
            <div style={styles.statValue}>{stats.total_arsip}</div>
            <div style={styles.statLabel}>Total Dokumen Terarsip</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '1.8rem' }}>📥</div>
          <div>
            <div style={styles.statValue}>{stats.total_surat_masuk}</div>
            <div style={styles.statLabel}>Surat Masuk</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '1.8rem' }}>📤</div>
          <div>
            <div style={styles.statValue}>{stats.total_surat_keluar}</div>
            <div style={styles.statLabel}>Surat Keluar</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '1.8rem' }}>📎</div>
          <div>
            <div style={styles.statValue}>{stats.total_lampiran}</div>
            <div style={styles.statLabel}>Ber-lampiran File</div>
          </div>
        </div>
      </div>

      {/* Bar Filter & Pencarian */}
      <div style={styles.filterCard} className="filter-card">
        <form onSubmit={handleSearchSubmit} style={styles.filterForm}>
          {/* Keyword Search */}
          <div style={{ flex: 2, minWidth: '220px' }}>
            <label style={styles.label}>Pencarian Keyword</label>
            <input
              type="text"
              placeholder="Cari nomor, perihal, pengirim/tujuan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Filter Jenis */}
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={styles.label}>Jenis Dokumen</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={styles.select}
            >
              <option value="all">Semua Jenis</option>
              <option value="surat_masuk">📥 Surat Masuk</option>
              <option value="surat_keluar">📤 Surat Keluar</option>
            </select>
          </div>

          {/* Filter Rentang Tanggal */}
          <div style={{ flex: 1, minWidth: '130px' }}>
            <label style={styles.label}>Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={{ flex: 1, minWidth: '130px' }}>
            <label style={styles.label}>Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Filter Status Approval */}
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label style={styles.label}>Status Approval</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={styles.select}
            >
              <option value="all">Semua Status</option>
              <option value="Disetujui">✓ Disetujui / Aktif</option>
              <option value="Pending">⏳ Pending</option>
              <option value="Ditolak">✖ Ditolak</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <button type="submit" style={styles.btnSearch}>
              🔍 Cari
            </button>
            <button type="button" onClick={handleResetFilter} style={styles.btnReset}>
              🔄 Reset
            </button>
            <button type="button" onClick={handlePrint} style={styles.btnPrint}>
              🖨️ Cetak / PDF
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Arsip Digital */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            Memuat data arsip...
          </div>
        ) : arsip.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>📭</span>
            Tidak ada data arsip yang sesuai dengan kriteria filter.
          </div>
        ) : (
          <table style={styles.table} className="print-table">
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Jenis</th>
                <th style={styles.th}>Nomor Surat</th>
                <th style={styles.th}>Tanggal</th>
                <th style={styles.th}>Pengirim / Tujuan</th>
                <th style={styles.th}>Perihal</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Lampiran</th>
                <th style={{ ...styles.th, textAlign: 'center' }} className="no-print">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {arsip.map((item, index) => (
                <tr key={`${item.jenis_code}-${item.id}`} style={styles.tr}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>
                    {item.jenis_code === 'surat_masuk' ? (
                      <span style={styles.badgeMasuk}>📥 Surat Masuk</span>
                    ) : (
                      <span style={styles.badgeKeluar}>📤 Surat Keluar</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, fontWeight: '600', color: '#1e293b' }}>
                    {item.nomor_surat}
                  </td>
                  <td style={styles.td}>
                    {new Date(item.tanggal_surat).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td style={styles.td}>{item.pihak}</td>
                  <td style={{ ...styles.td, maxWidth: '240px' }}>{item.perihal}</td>
                  <td style={styles.td}>
                    {item.status_approval === 'Disetujui' && (
                      <span style={styles.statusSetuju}>✓ Disetujui</span>
                    )}
                    {item.status_approval === 'Pending' && (
                      <span style={styles.statusPending}>⏳ Pending</span>
                    )}
                    {item.status_approval === 'Ditolak' && (
                      <span style={styles.statusTolak}>✖ Ditolak</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {item.file_url ? (
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.linkFile}
                      >
                        📎 Lihat File
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }} className="no-print">
                    <Link to={item.detail_url} style={styles.btnDetail}>
                      👁️ Detail
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

const styles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  filterCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '1.25rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
  },
  filterForm: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'flex-end',
  },
  label: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    backgroundColor: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btnSearch: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '0.55rem 1.1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  btnReset: {
    backgroundColor: '#94a3b8',
    color: '#fff',
    border: 'none',
    padding: '0.55rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  btnPrint: {
    backgroundColor: '#059669',
    color: '#fff',
    border: 'none',
    padding: '0.55rem 1.1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.875rem',
  },
  thRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '0.875rem 1rem',
    fontWeight: '600',
    color: '#475569',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '0.875rem 1rem',
    color: '#334155',
  },
  badgeMasuk: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
  },
  badgeKeluar: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#f5f3ff',
    color: '#7c3aed',
    border: '1px solid #ddd6fe',
  },
  statusSetuju: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusPending: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusTolak: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  linkFile: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
  btnDetail: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.8rem',
  },
};
