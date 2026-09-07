import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getDisposisi, updateDisposisi, deleteDisposisi } from '../../services/api';

export default function DisposisiList() {
  const [disposisiList, setDisposisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDisposisi();
      if (!res.success) throw new Error(res.message);
      setDisposisiList(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data disposisi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, perihal) => {
    if (!confirm(`Hapus disposisi untuk "${perihal || 'surat ini'}"?`)) return;
    try {
      const res = await deleteDisposisi(id);
      if (!res.success) throw new Error(res.message);
      setDisposisiList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateDisposisi(id, { status: newStatus });
      if (!res.success) throw new Error(res.message);
      setDisposisiList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      alert('Gagal memperbarui status: ' + err.message);
    }
  };

  const filtered = disposisiList.filter((item) => {
    const matchSearch =
      item.surat_masuk?.nomor_surat?.toLowerCase().includes(search.toLowerCase()) ||
      item.surat_masuk?.perihal?.toLowerCase().includes(search.toLowerCase()) ||
      item.instruksi?.toLowerCase().includes(search.toLowerCase()) ||
      item.pengirim?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.penerima?.full_name?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getSifatBadge = (sifat) => {
    const s = (sifat || '').toLowerCase();
    if (s === 'rahasia') return <span style={{ ...styles.badge, ...styles.badgeRahasia }}>Rahasia</span>;
    if (s === 'segera') return <span style={{ ...styles.badge, ...styles.badgeSegera }}>Segera</span>;
    if (s === 'penting') return <span style={{ ...styles.badge, ...styles.badgePenting }}>Penting</span>;
    return <span style={{ ...styles.badge, ...styles.badgeBiasa }}>Biasa</span>;
  };

  const getStatusBadge = (status) => {
    const st = (status || '').toLowerCase();
    if (st === 'selesai') return <span style={{ ...styles.badge, ...styles.badgeSelesai }}>✓ Selesai</span>;
    if (st === 'diproses') return <span style={{ ...styles.badge, ...styles.badgeDiproses }}>⚡ Diproses</span>;
    return <span style={{ ...styles.badge, ...styles.badgeMenunggu }}>⏳ Menunggu</span>;
  };

  return (
    <Layout title="Disposisi Surat">
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="🔍 Cari nomor surat, perihal, penerima, atau instruksi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.filterGroup}>
          <button
            onClick={() => setStatusFilter('ALL')}
            style={statusFilter === 'ALL' ? styles.filterBtnActive : styles.filterBtn}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter('Menunggu')}
            style={statusFilter === 'Menunggu' ? styles.filterBtnActive : styles.filterBtn}
          >
            ⏳ Menunggu
          </button>
          <button
            onClick={() => setStatusFilter('Diproses')}
            style={statusFilter === 'Diproses' ? styles.filterBtnActive : styles.filterBtn}
          >
            ⚡ Diproses
          </button>
          <button
            onClick={() => setStatusFilter('Selesai')}
            style={statusFilter === 'Selesai' ? styles.filterBtnActive : styles.filterBtn}
          >
            ✓ Selesai
          </button>
        </div>
        <button onClick={() => navigate('/disposisi/tambah')} style={styles.addBtn}>
          + Buat Disposisi
        </button>
      </div>

      {/* Error */}
      {error && <div style={styles.alertError}>{error}</div>}

      {/* Loading & Empty */}
      {loading ? (
        <div style={styles.empty}>Memuat data disposisi…</div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          {search || statusFilter !== 'ALL'
            ? 'Tidak ada disposisi yang sesuai dengan kriteria filter.'
            : 'Belum ada data disposisi.'}
        </div>
      ) : (
        /* Table */
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>No</th>
                <th style={styles.th}>Surat Masuk</th>
                <th style={styles.th}>Pengirim → Penerima</th>
                <th style={styles.th}>Instruksi / Catatan</th>
                <th style={styles.th}>Sifat</th>
                <th style={styles.th}>Batas Waktu</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => (
                <tr key={item.id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}>
                    {item.surat_masuk ? (
                      <div>
                        <Link to={`/surat-masuk/${item.surat_masuk.id}`} style={styles.linkSurat}>
                          {item.surat_masuk.nomor_surat}
                        </Link>
                        <div style={styles.subText}>{item.surat_masuk.perihal}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>Surat tidak ada</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '500', color: '#1e293b' }}>
                      {item.pengirim?.full_name || 'Sistem'}
                    </div>
                    <div style={styles.subText}>
                      ➡️ {item.penerima?.full_name || '-'} ({item.penerima?.jabatan || item.penerima?.role || 'Staff'})
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '500', color: '#334155' }}>{item.instruksi}</div>
                    {item.catatan && <div style={styles.subText}>Catatan: {item.catatan}</div>}
                  </td>
                  <td style={styles.td}>{getSifatBadge(item.sifat)}</td>
                  <td style={styles.td}>{formatDate(item.batas_waktu)}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {getStatusBadge(item.status)}
                      <select
                        value={item.status || 'Menunggu'}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        style={styles.statusSelect}
                      >
                        <option value="Menunggu">Menunggu</option>
                        <option value="Diproses">Diproses</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionGroup}>
                      <Link to={`/disposisi/${item.id}/edit`} style={styles.btnEdit}>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, item.surat_masuk?.perihal)}
                        style={styles.btnDelete}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

const styles = {
  toolbar: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '220px',
    padding: '0.65rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.9rem',
    backgroundColor: '#fff',
    outline: 'none',
  },
  filterGroup: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#e2e8f0',
    padding: '3px',
    borderRadius: '8px',
  },
  filterBtn: {
    padding: '0.45rem 0.85rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '500',
    color: '#64748b',
    transition: 'all 0.15s',
  },
  filterBtnActive: {
    padding: '0.45rem 0.85rem',
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#1e293b',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  addBtn: {
    padding: '0.65rem 1.25rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
  },
  alertError: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.875rem',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    color: '#94a3b8',
    backgroundColor: '#fff',
    borderRadius: '10px',
    border: '1px dashed #e2e8f0',
  },
  tableWrapper: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    overflowX: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  th: {
    padding: '0.85rem 1rem',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'left',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '0.85rem 1rem',
    color: '#475569',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
  },
  trEven: { backgroundColor: '#fff' },
  trOdd: { backgroundColor: '#fafafa' },
  linkSurat: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '600',
  },
  subText: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  badgeBiasa: { backgroundColor: '#f1f5f9', color: '#475569' },
  badgePenting: { backgroundColor: '#fef3c7', color: '#b45309' },
  badgeSegera: { backgroundColor: '#ffedd5', color: '#c2410c' },
  badgeRahasia: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  badgeMenunggu: { backgroundColor: '#fef9c3', color: '#a16207' },
  badgeDiproses: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  badgeSelesai: { backgroundColor: '#dcfce7', color: '#15803d' },
  statusSelect: {
    padding: '2px 4px',
    fontSize: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    cursor: 'pointer',
    marginTop: '2px',
  },
  actionGroup: {
    display: 'flex',
    gap: '6px',
  },
  btnEdit: {
    padding: '4px 10px',
    backgroundColor: '#fef9c3',
    color: '#a16207',
    border: '1px solid #fde68a',
    borderRadius: '5px',
    textDecoration: 'none',
    fontSize: '0.78rem',
    fontWeight: '500',
  },
  btnDelete: {
    padding: '4px 10px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: '500',
  },
};
