import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getSuratMasuk, deleteSuratMasuk } from '../../services/api';

export default function SuratMasukList() {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSuratMasuk();
      if (!res.success) throw new Error(res.message);
      setSuratList(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data surat masuk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, nomor) => {
    if (!confirm(`Hapus surat "${nomor}"?`)) return;
    try {
      const res = await deleteSuratMasuk(id);
      if (!res.success) throw new Error(res.message);
      setSuratList((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const filtered = suratList.filter(
    (s) =>
      s.nomor_surat?.toLowerCase().includes(search.toLowerCase()) ||
      s.asal_surat?.toLowerCase().includes(search.toLowerCase()) ||
      s.perihal?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  return (
    <Layout title="Surat Masuk">
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="🔍  Cari nomor, asal, atau perihal..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <button onClick={() => navigate('/surat-masuk/tambah')} style={styles.addBtn}>
          + Tambah Surat
        </button>
      </div>

      {/* Error */}
      {error && <div style={styles.alertError}>{error}</div>}

      {/* Loading */}
      {loading ? (
        <div style={styles.empty}>Memuat data…</div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          {search ? 'Tidak ada surat yang cocok dengan pencarian.' : 'Belum ada data surat masuk.'}
        </div>
      ) : (
        /* Table */
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>No</th>
                <th style={styles.th}>Nomor Surat</th>
                <th style={styles.th}>Tanggal Surat</th>
                <th style={styles.th}>Asal Surat</th>
                <th style={styles.th}>Perihal</th>
                <th style={styles.th}>Lampiran</th>
                <th style={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((surat, i) => (
                <tr key={surat.id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={{ ...styles.td, fontWeight: '600', color: '#1e293b' }}>
                    {surat.nomor_surat}
                  </td>
                  <td style={styles.td}>{formatDate(surat.tanggal_surat)}</td>
                  <td style={styles.td}>{surat.asal_surat}</td>
                  <td style={styles.td}>{surat.perihal}</td>
                  <td style={styles.td}>
                    {surat.file_url ? (
                      <a href={surat.file_url} target="_blank" rel="noreferrer" style={styles.fileLink}>
                        📎 Lihat
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>-</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionGroup}>
                      <Link to={`/surat-masuk/${surat.id}`} style={styles.btnDetail}>
                        Detail
                      </Link>
                      <Link to={`/surat-masuk/${surat.id}/edit`} style={styles.btnEdit}>
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(surat.id, surat.nomor_surat)}
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
    minWidth: '200px',
    padding: '0.65rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.9rem',
    backgroundColor: '#fff',
    outline: 'none',
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
  fileLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  actionGroup: {
    display: 'flex',
    gap: '6px',
  },
  btnDetail: {
    padding: '4px 10px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '5px',
    textDecoration: 'none',
    fontSize: '0.78rem',
    fontWeight: '500',
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
