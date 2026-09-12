import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getSuratKeluarById, deleteSuratKeluar, approveSuratKeluar } from '../../services/api';

export default function SuratKeluarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surat, setSurat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Approval modal state
  const [showApprovalPanel, setShowApprovalPanel] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
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
    if (st === 'disetujui') return <span className="badge badge-success"><i className="fa-solid fa-check" /> Disetujui</span>;
    if (st === 'ditolak') return <span className="badge badge-danger"><i className="fa-solid fa-xmark" /> Ditolak</span>;
    return <span className="badge badge-warning"><i className="fa-solid fa-clock" /> Pending</span>;
  };

  if (loading)
    return (
      <Layout title="Detail Surat Keluar">
        <LoadingSpinner variant="page" text="Memuat detail surat keluar…" />
      </Layout>
    );
  if (error)
    return (
      <Layout title="Detail Surat Keluar">
        <div className="badge badge-danger" style={{ width: '100%', padding: '1rem' }}>
          <i className="fa-solid fa-triangle-exclamation" /> {error}
        </div>
      </Layout>
    );

  return (
    <Layout title="Detail Surat Keluar">
      <div style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2rem', margin: '0 auto' }}>
        {/* Main Card */}
        <div className="glass-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link to="/surat-keluar" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
              ← Kembali ke Daftar
            </Link>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to={`/surat-keluar/${id}/edit`} className="btn btn-secondary btn-sm" style={{ color: 'var(--warning)', borderColor: 'var(--warning-border)' }}>
                <i className="fa-solid fa-pen-to-square" /> Edit
              </Link>
              <button onClick={handleDelete} className="btn btn-danger btn-sm">
                <i className="fa-solid fa-trash-can" /> Hapus
              </button>
            </div>
          </div>

          {/* Nomor Surat */}
          <div style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Nomor Surat Keluar
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 0' }} className="title-gradient">
              {surat.nomor_surat || <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Belum ada nomor (Draft)</span>}
            </h2>
          </div>

          {/* Perihal */}
          <div style={{ background: 'rgba(255, 255, 255, 0.7)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-light)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, margin: '0 0 6px' }}>
              Perihal
            </p>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.6', margin: 0, fontWeight: 500 }}>
              {surat.perihal}
            </p>
          </div>

          {/* Ringkasan Isi */}
          {surat.isi_ringkas && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', margin: 0 }}>
                <i className="fa-solid fa-file-lines" /> Ringkasan Isi
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>{surat.isi_ringkas}</p>
            </div>
          )}

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <InfoItem label="Tujuan Surat" value={surat.tujuan_surat} />
            <InfoItem label="Tanggal Surat" value={formatDate(surat.tanggal_surat)} />
            <InfoItem label="Dibuat oleh" value={surat.creator?.full_name || '-'} />
            <InfoItem label="Tanggal Input" value={formatDate(surat.created_at)} />
          </div>

          {/* Lampiran */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', margin: 0 }}>
              <i className="fa-solid fa-paperclip" /> Lampiran Surat
            </p>
            {surat.file_url ? (
              <a href={surat.file_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }}>
                <i className="fa-solid fa-file-pdf" /> Buka Lampiran File
              </a>
            ) : (
              <span style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>Tidak ada lampiran file</span>
            )}
          </div>
        </div>

        {/* Approval Card */}
        <div className="glass-card animate-fade-in animate-delay-1" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              <i className="fa-solid fa-user-check" style={{ color: 'var(--primary)' }} /> Status Persetujuan (Approval)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
              {getApprovalBadge(surat.status_approval)}
            </div>

            {surat.approver && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                <InfoItem label="Diproses oleh" value={surat.approver?.full_name || '-'} />
                <InfoItem label="Waktu Persetujuan" value={formatDateTime(surat.approved_at)} />
              </div>
            )}

            {surat.catatan_approval && (
              <div style={{ background: 'rgba(255, 255, 255, 0.7)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 4px' }}>Catatan Approval:</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0 }}>{surat.catatan_approval}</p>
              </div>
            )}

            {/* Approval Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
              <button
                onClick={() => openApprovalPanel('Disetujui')}
                className="btn btn-success"
              >
                <i className="fa-solid fa-circle-check" /> Setujui Surat
              </button>
              <button
                onClick={() => openApprovalPanel('Ditolak')}
                className="btn btn-danger"
              >
                <i className="fa-solid fa-circle-xmark" /> Tolak Surat
              </button>
              {surat.status_approval !== 'Pending' && (
                <button
                  onClick={() => openApprovalPanel('Pending')}
                  className="btn btn-secondary"
                >
                  <i className="fa-solid fa-rotate-left" /> Reset ke Pending
                </button>
              )}
            </div>
          </div>

          {/* Approval Panel (inline modal) */}
          {showApprovalPanel && (
            <div className="glass-modal" style={{ padding: '1.25rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                {approvalAction === 'Disetujui'
                  ? 'Setujui Surat Keluar'
                  : approvalAction === 'Ditolak'
                  ? 'Tolak Surat Keluar'
                  : 'Reset Status ke Pending'}
              </h4>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Catatan (opsional):</label>
                <textarea
                  rows={3}
                  value={catatanApproval}
                  onChange={(e) => setCatatanApproval(e.target.value)}
                  placeholder="Tulis catatan persetujuan / penolakan..."
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowApprovalPanel(false)}
                  className="btn btn-secondary"
                >
                  Batal
                </button>
                <button
                  onClick={handleApproval}
                  disabled={approving}
                  className={`btn ${approvalAction === 'Disetujui' ? 'btn-success' : approvalAction === 'Ditolak' ? 'btn-danger' : 'btn-secondary'}`}
                >
                  {approving
                    ? 'Memproses...'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
        {label}
      </span>
      <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
        {value || '-'}
      </span>
    </div>
  );
}
