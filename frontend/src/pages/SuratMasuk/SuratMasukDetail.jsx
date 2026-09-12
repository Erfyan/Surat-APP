import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
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
    if (s === 'rahasia') return <span className="badge badge-danger"><i className="fa-solid fa-user-shield" /> Rahasia</span>;
    if (s === 'segera') return <span className="badge badge-warning"><i className="fa-solid fa-bolt" /> Segera</span>;
    if (s === 'penting') return <span className="badge badge-purple"><i className="fa-solid fa-thumbtack" /> Penting</span>;
    return <span className="badge badge-info"><i className="fa-solid fa-note-sticky" /> Biasa</span>;
  };

  if (loading)
    return (
      <Layout title="Detail Surat Masuk">
        <LoadingSpinner variant="page" text="Memuat detail surat masuk…" />
      </Layout>
    );
  if (error)
    return (
      <Layout title="Detail Surat Masuk">
        <div className="badge badge-danger" style={{ width: '100%', padding: '1rem' }}>
          <i className="fa-solid fa-triangle-exclamation" /> {error}
        </div>
      </Layout>
    );

  return (
    <Layout title="Detail Surat Masuk">
      <div style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2rem', margin: '0 auto' }}>
        {/* Header Card */}
        <div className="glass-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Top Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link to="/surat-masuk" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
              ← Kembali ke Daftar
            </Link>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to={`/disposisi/tambah?surat_id=${id}`} className="btn btn-primary btn-sm">
                <i className="fa-solid fa-share-nodes" /> Disposisikan
              </Link>
              <Link to={`/surat-masuk/${id}/edit`} className="btn btn-secondary btn-sm" style={{ color: 'var(--warning)', borderColor: 'var(--warning-border)' }}>
                <i className="fa-solid fa-pen-to-square" /> Edit
              </Link>
              <button onClick={handleDelete} className="btn btn-danger btn-sm">
                <i className="fa-solid fa-trash-can" /> Hapus
              </button>
            </div>
          </div>

          {/* Badge Nomor Surat */}
          <div style={{ paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Nomor Surat
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 0' }} className="title-gradient">
              {surat.nomor_surat}
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

          {/* Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <InfoItem label="Asal Surat" value={surat.asal_surat} />
            <InfoItem label="Tanggal Surat" value={formatDate(surat.tanggal_surat)} />
            <InfoItem label="Tanggal Diterima" value={formatDate(surat.tanggal_diterima)} />
            <InfoItem label="Diinput oleh" value={surat.creator?.full_name || '-'} />
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

        {/* Section Disposisi */}
        <div className="glass-card animate-fade-in animate-delay-1" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                <i className="fa-solid fa-clipboard-list" style={{ color: 'var(--primary)' }} /> Riwayat Disposisi Surat
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Daftar instruksi dan tindak lanjut penanganan surat masuk ini
              </p>
            </div>
            <Link to={`/disposisi/tambah?surat_id=${id}`} className="btn btn-primary btn-sm">
              <i className="fa-solid fa-plus" /> Buat Disposisi Baru
            </Link>
          </div>

          {disposisiList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.5)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-light)', fontSize: '0.875rem' }}>
              Belum ada disposisi untuk surat ini. Klik tombol di atas untuk membuat disposisi baru.
            </div>
          ) : (
            <div className="timeline">
              {disposisiList.map((d, index) => (
                <div key={d.id} className="timeline-item">
                  <div className="timeline-dot" />
                  <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-xs)' }}>
                          #{index + 1}
                        </span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          <strong>{d.pengirim?.full_name || 'Pimpinan'}</strong> <i className="fa-solid fa-arrow-right-long" />{' '}
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
                          className="input-field"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem', height: 'auto' }}
                        >
                          <option value="Menunggu">Menunggu</option>
                          <option value="Diproses">Diproses</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Instruksi Disposisi:</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>{d.instruksi}</div>
                      {d.catatan && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Catatan: {d.catatan}</div>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span><i className="fa-solid fa-calendar-day" /> Batas Waktu: {formatDate(d.batas_waktu)}</span>
                      <Link to={`/disposisi/${d.id}/edit`} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        Edit Disposisi
                      </Link>
                    </div>
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
