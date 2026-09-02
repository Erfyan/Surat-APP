import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getSuratMasukById, deleteSuratMasuk } from '../../services/api';

export default function SuratMasukDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surat, setSurat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getSuratMasukById(id);
        if (!res.success) throw new Error(res.message);
        setSurat(res.data);
      } catch (err) {
        setError(err.message || 'Data tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  if (loading) return <Layout title="Detail Surat Masuk"><div style={styles.center}>Memuat…</div></Layout>;
  if (error) return <Layout title="Detail Surat Masuk"><div style={styles.alertError}>{error}</div></Layout>;

  return (
    <Layout title="Detail Surat Masuk">
      {/* Header Card */}
      <div style={styles.card}>
        {/* Breadcrumb / Actions */}
        <div style={styles.topBar}>
          <Link to="/surat-masuk" style={styles.backLink}>← Kembali ke Daftar</Link>
          <div style={styles.topActions}>
            <Link to={`/surat-masuk/${id}/edit`} style={styles.editBtn}>✏️ Edit</Link>
            <button onClick={handleDelete} style={styles.deleteBtn}>🗑 Hapus</button>
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
          <p style={styles.sectionLabel}>📎 Lampiran</p>
          {surat.file_url ? (
            <a href={surat.file_url} target="_blank" rel="noreferrer" style={styles.fileBtn}>
              Buka Lampiran
            </a>
          ) : (
            <span style={styles.noFile}>Tidak ada lampiran</span>
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
    backgroundColor: '#fee2e2', color: '#b91c1c',
    padding: '1rem', borderRadius: '8px', fontSize: '0.875rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '2rem',
    maxWidth: '860px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backLink: {
    color: '#2563eb', textDecoration: 'none',
    fontSize: '0.875rem', fontWeight: '500',
  },
  topActions: { display: 'flex', gap: '0.75rem' },
  editBtn: {
    padding: '6px 14px',
    backgroundColor: '#fef9c3', color: '#a16207',
    border: '1px solid #fde68a', borderRadius: '6px',
    textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500',
  },
  deleteBtn: {
    padding: '6px 14px',
    backgroundColor: '#fee2e2', color: '#b91c1c',
    border: '1px solid #fecaca', borderRadius: '6px',
    cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500',
  },
  nomorBadge: {
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #f1f5f9',
  },
  nomorLabel: {
    fontSize: '0.75rem', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    margin: '0 0 6px',
  },
  nomorText: {
    fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0,
  },
  perihalBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
  },
  perihalLabel: {
    fontSize: '0.75rem', color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    margin: '0 0 6px',
  },
  perihalText: {
    fontSize: '1rem', color: '#1e293b',
    lineHeight: '1.6', margin: 0,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1.25rem',
  },
  section: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  sectionLabel: {
    fontSize: '0.8rem', fontWeight: '600',
    color: '#64748b', margin: 0,
  },
  fileBtn: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '0.875rem', fontWeight: '500',
    width: 'fit-content',
  },
  noFile: { fontSize: '0.875rem', color: '#94a3b8' },
};

const infoStyles = {
  item: {
    display: 'flex', flexDirection: 'column', gap: '4px',
  },
  label: {
    fontSize: '0.75rem', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  value: {
    fontSize: '0.9rem', color: '#1e293b', fontWeight: '500',
  },
};
