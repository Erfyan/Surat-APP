import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  getSuratMasukById,
  deleteSuratMasuk,
  getDisposisiBySuratId,
  updateDisposisi,
} from '../../services/api';

export default function SuratMasukDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surat, setSurat] = useState(null);
  const [disposisiList, setDisposisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        const [suratRes, dispRes] = await Promise.all([
          getSuratMasukById(id),
          getDisposisiBySuratId(id),
        ]);

        if (!suratRes.success) throw new Error(suratRes.message);
        setSurat(suratRes.data);

        if (dispRes.success) {
          setDisposisiList(dispRes.data || []);
        }
      } catch (err) {
        setError(err.message || 'Data tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };
    fetchDetailData();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Hapus surat "${surat.nomor_surat}"?`)) return;
    try {
      const res = await deleteSuratMasuk(id);
      if (!res.success) throw new Error(res.message);
      navigate('/surat-masuk');
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const handleStatusChange = async (disposisiId, newStatus) => {
    try {
      const res = await updateDisposisi(disposisiId, { status: newStatus });
      if (!res.success) throw new Error(res.message);
      setDisposisiList((prev) =>
        prev.map((d) => (d.id === disposisiId ? { ...d, status: newStatus } : d))
      );
    } catch (err) {
      alert('Gagal mengupdate status disposisi: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
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

  if (loading)
    return (
      <Layout title="Detail Surat Masuk">
        <div style={styles.center}>Memuat…</div>
      </Layout>
    );
  if (error)
    return (
      <Layout title="Detail Surat Masuk">
        <div style={styles.alertError}>{error}</div>
      </Layout>
    );

  return (
    <Layout title="Detail Surat Masuk">
      <div style={styles.container}>
        {/* Header Card */}
        <div style={styles.card}>
          {/* Breadcrumb / Actions */}
          <div style={styles.topBar}>
            <Link to="/surat-masuk" style={styles.backLink}>
              ← Kembali ke Daftar
            </Link>
            <div style={styles.topActions}>
              <Link to={`/disposisi/tambah?surat_id=${id}`} style={styles.disposisiBtn}>
                📌 Disposisikan
              </Link>
              <Link to={`/surat-masuk/${id}/edit`} style={styles.editBtn}>
                ✏️ Edit
              </Link>
              <button onClick={handleDelete} style={styles.deleteBtn}>
                🗑 Hapus
              </button>
            </div>
          </div>

          {/* Badge Nomor Surat */}
          <div style={styles.nomorBadge}>
            <span style={styles.nomorLabel}>Nomor Surat</span>
            <h2 style={styles.nomorText}>{surat.nomor_surat}</h2>
          </div>

          {/* Perihal */}
          <div style={styles.perihalBox}>
            <p style={styles.perihalLabel}>Perihal</p>
            <p style={styles.perihalText}>{surat.perihal}</p>
          </div>

          {/* Info Grid */}
          <div style={styles.infoGrid}>
            <InfoItem label="Asal Surat" value={surat.asal_surat} />
            <InfoItem label="Tanggal Surat" value={formatDate(surat.tanggal_surat)} />
            <InfoItem label="Tanggal Diterima" value={formatDate(surat.tanggal_diterima)} />
            <InfoItem label="Diinput oleh" value={surat.creator?.full_name || '-'} />
            <InfoItem label="Tanggal Input" value={formatDate(surat.created_at)} />
          </div>

          {/* Lampiran */}
          <div style={styles.section}>
            <p style={styles.sectionLabel}>📎 Lampiran Surat</p>
            {surat.file_url ? (
              <a href={surat.file_url} target="_blank" rel="noreferrer" style={styles.fileBtn}>
                Buka Lampiran
              </a>
            ) : (
              <span style={styles.noFile}>Tidak ada lampiran</span>
            )}
          </div>
        </div>

        {/* Seksi Disposisi Surat */}
        <div style={styles.disposisiCard}>
          <div style={styles.disposisiHeader}>
            <div>
              <h3 style={styles.disposisiTitle}>📌 Riwayat Disposisi Surat</h3>
              <p style={styles.disposisiSubtitle}>
                Daftar instruksi dan tindak lanjut penanganan surat masuk ini
              </p>
            </div>
            <Link to={`/disposisi/tambah?surat_id=${id}`} style={styles.addDispBtn}>
              + Buat Disposisi Baru
            </Link>
          </div>

          {disposisiList.length === 0 ? (
            <div style={styles.emptyDisposisi}>
              Belum ada disposisi untuk surat ini. Klik tombol di atas untuk membuat disposisi baru.
            </div>
          ) : (
            <div style={styles.dispList}>
              {disposisiList.map((d, index) => (
                <div key={d.id} style={styles.dispItem}>
                  <div style={styles.dispTopRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={styles.dispNum}>#{index + 1}</span>
                      <span style={styles.dispUsers}>
                        <strong>{d.pengirim?.full_name || 'Pimpinan'}</strong> ➔{' '}
                        <strong>
                          {d.penerima?.full_name || 'Staff'} ({d.penerima?.jabatan || d.penerima?.role || 'Staff'})
                        </strong>
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getSifatBadge(d.sifat)}
                      <select
                        value={d.status || 'Menunggu'}
                        onChange={(e) => handleStatusChange(d.id, e.target.value)}
                        style={styles.statusSelect}
                      >
                        <option value="Menunggu">⏳ Menunggu</option>
                        <option value="Diproses">⚡ Diproses</option>
                        <option value="Selesai">✓ Selesai</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.instruksiBox}>
                    <div style={styles.instruksiLabel}>Instruksi Disposisi:</div>
                    <div style={styles.instruksiText}>{d.instruksi}</div>
                    {d.catatan && <div style={styles.catatanText}>Catatan: {d.catatan}</div>}
                  </div>

                  <div style={styles.dispMeta}>
                    <span>🗓 Batas Waktu: {formatDate(d.batas_waktu)}</span>
                    <Link to={`/disposisi/${d.id}/edit`} style={styles.editDispLink}>
                      Edit Disposisi
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// Komponen kecil untuk info item
function InfoItem({ label, value }) {
  return (
    <div style={infoStyles.item}>
      <span style={infoStyles.label}>{label}</span>
      <span style={infoStyles.value}>{value || '-'}</span>
    </div>
  );
}

const styles = {
  center: { textAlign: 'center', padding: '3rem', color: '#94a3b8' },
  alertError: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
  },
  container: {
    maxWidth: '880px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  backLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  topActions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  disposisiBtn: {
    padding: '6px 14px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  editBtn: {
    padding: '6px 14px',
    backgroundColor: '#fef9c3',
    color: '#a16207',
    border: '1px solid #fde68a',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  deleteBtn: {
    padding: '6px 14px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  nomorBadge: {
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #f1f5f9',
  },
  nomorLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 6px',
  },
  nomorText: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  perihalBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
  },
  perihalLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 6px',
  },
  perihalText: {
    fontSize: '1rem',
    color: '#1e293b',
    lineHeight: '1.6',
    margin: 0,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1.25rem',
  },
  section: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  sectionLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#64748b',
    margin: 0,
  },
  fileBtn: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    width: 'fit-content',
  },
  noFile: { fontSize: '0.875rem', color: '#94a3b8' },

  // Disposisi Section Styles
  disposisiCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  disposisiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '1rem',
  },
  disposisiTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  disposisiSubtitle: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: '4px 0 0',
  },
  addDispBtn: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  emptyDisposisi: {
    textAlign: 'center',
    padding: '2rem',
    color: '#94a3b8',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
    fontSize: '0.875rem',
  },
  dispList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  dispItem: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1.25rem',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  dispTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  dispNum: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  dispUsers: { fontSize: '0.9rem', color: '#1e293b' },
  instruksiBox: {
    backgroundColor: '#fff',
    padding: '0.85rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  instruksiLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    marginBottom: '2px',
  },
  instruksiText: { fontSize: '0.9rem', color: '#1e293b', fontWeight: '500' },
  catatanText: { fontSize: '0.8rem', color: '#64748b', marginTop: '4px' },
  dispMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#64748b',
  },
  editDispLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  badgeBiasa: { backgroundColor: '#e2e8f0', color: '#475569' },
  badgePenting: { backgroundColor: '#fef3c7', color: '#b45309' },
  badgeSegera: { backgroundColor: '#ffedd5', color: '#c2410c' },
  badgeRahasia: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  statusSelect: {
    padding: '4px 8px',
    fontSize: '0.8rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

const infoStyles = {
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  value: {
    fontSize: '0.9rem',
    color: '#1e293b',
    fontWeight: '500',
  },
};
