import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getSuratKeluarById, deleteSuratKeluar, approveSuratKeluar } from '../../services/api';

export default function SuratKeluarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surat, setSurat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Approval modal state
  const [showApprovalPanel, setShowApprovalPanel] = useState(false);
  const [approvalAction, setApprovalAction] = useState(''); // 'Disetujui' or 'Ditolak'
  const [catatanApproval, setCatatanApproval] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await getSuratKeluarById(id);
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
    if (!confirm(`Hapus surat keluar "${surat.nomor_surat || 'Draft'}"?`)) return;
    try {
      const res = await deleteSuratKeluar(id);
      if (!res.success) throw new Error(res.message);
      navigate('/surat-keluar');
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const openApprovalPanel = (action) => {
    setApprovalAction(action);
    setCatatanApproval('');
    setShowApprovalPanel(true);
  };

  const handleApproval = async () => {
    setApproving(true);
    try {
      const res = await approveSuratKeluar(id, approvalAction, catatanApproval);
      if (!res.success) throw new Error(res.message);
      setSurat(res.data);
      setShowApprovalPanel(false);
    } catch (err) {
      alert('Gagal memproses approval: ' + err.message);
    } finally {
      setApproving(false);
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

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getApprovalBadge = (status) => {
    const st = (status || '').toLowerCase();
    if (st === 'disetujui')
      return <span style={{ ...styles.badge, ...styles.badgeApproved }}>✓ Disetujui</span>;
    if (st === 'ditolak')
      return <span style={{ ...styles.badge, ...styles.badgeRejected }}>✖ Ditolak</span>;
    return <span style={{ ...styles.badge, ...styles.badgePending }}>⏳ Pending</span>;
  };

  if (loading)
    return (
      <Layout title="Detail Surat Keluar">
        <div style={styles.center}>Memuat…</div>
      </Layout>
    );
  if (error)
    return (
      <Layout title="Detail Surat Keluar">
        <div style={styles.alertError}>{error}</div>
      </Layout>
    );

  return (
    <Layout title="Detail Surat Keluar">
      <div style={styles.container}>
        {/* Main Card */}
        <div style={styles.card}>
          {/* Top Bar */}
          <div style={styles.topBar}>
            <Link to="/surat-keluar" style={styles.backLink}>
              ← Kembali ke Daftar
            </Link>
            <div style={styles.topActions}>
              <Link to={`/surat-keluar/${id}/edit`} style={styles.editBtn}>
                ✏️ Edit
              </Link>
              <button onClick={handleDelete} style={styles.deleteBtn}>
                🗑 Hapus
              </button>
            </div>
          </div>

          {/* Nomor Surat */}
          <div style={styles.nomorBadge}>
            <span style={styles.nomorLabel}>Nomor Surat Keluar</span>
            <h2 style={styles.nomorText}>
              {surat.nomor_surat || (
                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Belum ada nomor (Draft)</span>
              )}
            </h2>
          </div>

          {/* Perihal */}
          <div style={styles.perihalBox}>
            <p style={styles.perihalLabel}>Perihal</p>
            <p style={styles.perihalText}>{surat.perihal}</p>
          </div>

          {/* Isi Ringkas (if any) */}
          {surat.isi_ringkas && (
            <div style={styles.section}>
              <p style={styles.sectionLabel}>📝 Ringkasan Isi</p>
              <p style={styles.isiText}>{surat.isi_ringkas}</p>
            </div>
          )}

          {/* Info Grid */}
          <div style={styles.infoGrid}>
            <InfoItem label="Tujuan Surat" value={surat.tujuan_surat} />
            <InfoItem label="Tanggal Surat" value={formatDate(surat.tanggal_surat)} />
            <InfoItem label="Dibuat oleh" value={surat.creator?.full_name || '-'} />
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

        {/* Approval Card */}
        <div style={styles.approvalCard}>
          <div style={styles.approvalHeader}>
            <h3 style={styles.approvalTitle}>📋 Status Persetujuan (Approval)</h3>
          </div>

          <div style={styles.approvalBody}>
            <div style={styles.approvalStatusRow}>
              <span style={styles.approvalStatusLabel}>Status:</span>
              {getApprovalBadge(surat.status_approval)}
            </div>

            {surat.approver && (
              <div style={styles.approvalInfoRow}>
                <InfoItem label="Diproses oleh" value={surat.approver?.full_name || '-'} />
                <InfoItem label="Waktu Persetujuan" value={formatDateTime(surat.approved_at)} />
              </div>
            )}

            {surat.catatan_approval && (
              <div style={styles.catatanBox}>
                <p style={styles.catatanLabel}>Catatan Approval:</p>
                <p style={styles.catatanText}>{surat.catatan_approval}</p>
              </div>
            )}

            {/* Approval Action Buttons */}
            <div style={styles.approvalActions}>
              <button
                onClick={() => openApprovalPanel('Disetujui')}
                style={styles.approveBtn}
              >
                ✅ Setujui Surat
              </button>
              <button
                onClick={() => openApprovalPanel('Ditolak')}
                style={styles.rejectBtn}
              >
                ❌ Tolak Surat
              </button>
              {surat.status_approval !== 'Pending' && (
                <button
                  onClick={() => openApprovalPanel('Pending')}
                  style={styles.resetBtn}
                >
                  ↩ Reset ke Pending
                </button>
              )}
            </div>
          </div>

          {/* Approval Panel (inline modal) */}
          {showApprovalPanel && (
            <div style={styles.approvalPanel}>
              <h4 style={styles.panelTitle}>
                {approvalAction === 'Disetujui'
                  ? '✅ Setujui Surat Keluar'
                  : approvalAction === 'Ditolak'
                  ? '❌ Tolak Surat Keluar'
                  : '↩ Reset Status ke Pending'}
              </h4>
              <div style={styles.panelField}>
                <label style={styles.panelLabel}>Catatan (opsional):</label>
                <textarea
                  rows={3}
                  value={catatanApproval}
                  onChange={(e) => setCatatanApproval(e.target.value)}
                  placeholder="Tulis catatan persetujuan / penolakan..."
                  style={styles.panelTextarea}
                />
              </div>
              <div style={styles.panelActions}>
                <button
                  onClick={() => setShowApprovalPanel(false)}
                  style={styles.panelCancelBtn}
                >
                  Batal
                </button>
                <button
                  onClick={handleApproval}
                  disabled={approving}
                  style={
                    approvalAction === 'Disetujui'
                      ? styles.panelConfirmApproveBtn
                      : approvalAction === 'Ditolak'
                      ? styles.panelConfirmRejectBtn
                      : styles.panelConfirmResetBtn
                  }
                >
                  {approving
                    ? 'Memproses…'
                    : approvalAction === 'Disetujui'
                    ? 'Konfirmasi Setujui'
                    : approvalAction === 'Ditolak'
                    ? 'Konfirmasi Tolak'
                    : 'Konfirmasi Reset'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

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
  topActions: { display: 'flex', gap: '0.5rem' },
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
  nomorBadge: { paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' },
  nomorLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 6px',
  },
  nomorText: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 },
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
  perihalText: { fontSize: '1rem', color: '#1e293b', lineHeight: '1.6', margin: 0 },
  section: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  sectionLabel: { fontSize: '0.8rem', fontWeight: '600', color: '#64748b', margin: 0 },
  isiText: { fontSize: '0.9rem', color: '#475569', lineHeight: '1.6', margin: 0 },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1.25rem',
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

  // Approval Card
  approvalCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  approvalHeader: { borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' },
  approvalTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  approvalBody: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  approvalStatusRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  approvalStatusLabel: { fontSize: '0.9rem', fontWeight: '600', color: '#475569' },
  approvalInfoRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  catatanBox: {
    backgroundColor: '#f8fafc',
    padding: '0.85rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  catatanLabel: { fontSize: '0.75rem', fontWeight: '600', color: '#64748b', margin: '0 0 4px' },
  catatanText: { fontSize: '0.9rem', color: '#1e293b', margin: 0 },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  badgePending: { backgroundColor: '#fef9c3', color: '#a16207' },
  badgeApproved: { backgroundColor: '#dcfce7', color: '#15803d' },
  badgeRejected: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  approvalActions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    paddingTop: '0.5rem',
  },
  approveBtn: {
    padding: '8px 18px',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  rejectBtn: {
    padding: '8px 18px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  resetBtn: {
    padding: '8px 18px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.85rem',
  },

  // Approval Panel (inline)
  approvalPanel: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  panelTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', margin: 0 },
  panelField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  panelLabel: { fontSize: '0.85rem', fontWeight: '600', color: '#475569' },
  panelTextarea: {
    padding: '0.65rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
  },
  panelActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' },
  panelCancelBtn: {
    padding: '0.55rem 1rem',
    backgroundColor: '#fff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#475569',
  },
  panelConfirmApproveBtn: {
    padding: '0.55rem 1rem',
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  panelConfirmRejectBtn: {
    padding: '0.55rem 1rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  panelConfirmResetBtn: {
    padding: '0.55rem 1rem',
    backgroundColor: '#475569',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
};

const infoStyles = {
  item: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  value: { fontSize: '0.9rem', color: '#1e293b', fontWeight: '500' },
};
