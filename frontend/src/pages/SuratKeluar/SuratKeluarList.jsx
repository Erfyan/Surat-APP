import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getSuratKeluar, deleteSuratKeluar } from '../../services/api';

export default function SuratKeluarList() {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, nomor: '' });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSuratKeluar();
      if (!res.success) throw new Error(res.message);
      setSuratList(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data surat keluar');
      addToast(err.message || 'Gagal memuat data surat keluar', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDeleteModal = (id, nomor) => {
    setDeleteModal({ isOpen: true, id, nomor: nomor || 'Draft' });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null, nomor: '' });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      const res = await deleteSuratKeluar(deleteModal.id);
      if (!res.success) throw new Error(res.message);
      setSuratList((prev) => prev.filter((s) => s.id !== deleteModal.id));
      addToast(`Surat Keluar "${deleteModal.nomor}" berhasil dihapus.`, 'success');
      closeDeleteModal();
    } catch (err) {
      addToast('Gagal menghapus: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = suratList.filter((s) => {
    const matchSearch =
      s.nomor_surat?.toLowerCase().includes(search.toLowerCase()) ||
      s.tujuan_surat?.toLowerCase().includes(search.toLowerCase()) ||
      s.perihal?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || s.status_approval === statusFilter;

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

  const getApprovalBadge = (status) => {
    const st = (status || '').toLowerCase();
    if (st === 'disetujui') return <span className="badge badge-success"><i className="fa-solid fa-check" /> Disetujui</span>;
    if (st === 'ditolak') return <span className="badge badge-danger"><i className="fa-solid fa-xmark" /> Ditolak</span>;
    return <span className="badge badge-warning"><i className="fa-solid fa-clock" /> Pending</span>;
  };

  return (
    <Layout title="Surat Keluar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Glass Toolbar */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Cari nomor, tujuan, atau perihal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.25rem' }}
            />
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'rgba(241, 245, 249, 0.9)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            {['ALL', 'Pending', 'Disetujui', 'Ditolak'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              >
                {st === 'ALL'
                  ? 'Semua'
                  : st === 'Pending'
                  ? <><i className="fa-solid fa-clock" /> Pending</>
                  : st === 'Disetujui'
                  ? <><i className="fa-solid fa-check" /> Disetujui</>
                  : <><i className="fa-solid fa-xmark" /> Ditolak</>}
              </button>
            ))}
          </div>

          <button onClick={() => navigate('/surat-keluar/tambah')} className="btn btn-success" style={{ marginLeft: 'auto' }}>
            <i className="fa-solid fa-plus" /> Buat Surat Keluar
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.875rem 1.25rem', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-triangle-exclamation" /> {error}
          </div>
        )}

        {/* Loading & Empty */}
        {loading ? (
          <LoadingSpinner variant="inline" text="Memuat data surat keluar…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="fa-paper-plane"
            title="Belum Ada Surat Keluar"
            description={search || statusFilter !== 'ALL' ? 'Tidak ada surat keluar yang sesuai dengan kriteria filter.' : 'Belum ada data surat keluar diajukan.'}
            actionLink="/surat-keluar/tambah"
            actionText="Buat Surat Keluar"
          />
        ) : (
          <div className="table-container glass-card">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nomor Surat</th>
                  <th>Tanggal</th>
                  <th>Tujuan</th>
                  <th>Perihal</th>
                  <th>Lampiran</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((surat, i) => (
                  <tr key={surat.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-light)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      <Link to={`/surat-keluar/${surat.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                        {surat.nomor_surat || <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Draft</span>}
                      </Link>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(surat.tanggal_surat)}</td>
                    <td style={{ fontWeight: 600 }}>{surat.tujuan_surat}</td>
                    <td>{surat.perihal}</td>
                    <td>
                      {surat.file_url ? (
                        <a href={surat.file_url} target="_blank" rel="noreferrer" className="badge badge-info" style={{ textDecoration: 'none' }}>
                          <i className="fa-solid fa-paperclip" /> Lihat
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>-</span>
                      )}
                    </td>
                    <td>{getApprovalBadge(surat.status_approval)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <Link to={`/surat-keluar/${surat.id}`} className="btn btn-secondary btn-sm">
                          <i className="fa-solid fa-eye" /> Detail
                        </Link>
                        <Link to={`/surat-keluar/${surat.id}/edit`} className="btn btn-secondary btn-sm" style={{ color: 'var(--warning)', borderColor: 'var(--warning-border)' }}>
                          <i className="fa-solid fa-pen-to-square" /> Edit
                        </Link>
                        <button
                          onClick={() => openDeleteModal(surat.id, surat.nomor_surat)}
                          className="btn btn-danger btn-sm"
                        >
                          <i className="fa-solid fa-trash-can" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Hapus Surat Keluar"
        message={`Apakah Anda yakin ingin menghapus surat keluar "${deleteModal.nomor}"? Data yang dihapus tidak dapat dikembalikan.`}
        confirmText="Hapus Surat"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        loading={deleting}
      />
    </Layout>
  );
}
