import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getDisposisi, updateDisposisi, deleteDisposisi } from '../../services/api';

export default function DisposisiList() {
  const [disposisiList, setDisposisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, perihal: '' });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDisposisi();
      if (!res.success) throw new Error(res.message);
      setDisposisiList(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data disposisi');
      addToast(err.message || 'Gagal memuat data disposisi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDeleteModal = (id, perihal) => {
    setDeleteModal({ isOpen: true, id, perihal: perihal || 'surat ini' });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null, perihal: '' });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      const res = await deleteDisposisi(deleteModal.id);
      if (!res.success) throw new Error(res.message);
      setDisposisiList((prev) => prev.filter((item) => item.id !== deleteModal.id));
      addToast(`Disposisi berhasil dihapus.`, 'success');
      closeDeleteModal();
    } catch (err) {
      addToast('Gagal menghapus: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateDisposisi(id, { status: newStatus });
      if (!res.success) throw new Error(res.message);
      setDisposisiList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      addToast(`Status disposisi diperbarui ke "${newStatus}".`, 'info');
    } catch (err) {
      addToast('Gagal memperbarui status: ' + err.message, 'error');
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
    if (s === 'rahasia') return <span className="badge badge-danger"><i className="fa-solid fa-user-shield" /> Rahasia</span>;
    if (s === 'segera') return <span className="badge badge-warning"><i className="fa-solid fa-bolt" /> Segera</span>;
    if (s === 'penting') return <span className="badge badge-purple"><i className="fa-solid fa-thumbtack" /> Penting</span>;
    return <span className="badge badge-info"><i className="fa-solid fa-note-sticky" /> Biasa</span>;
  };

  const getStatusBadge = (status) => {
    const st = (status || '').toLowerCase();
    if (st === 'selesai') return <span className="badge badge-success"><i className="fa-solid fa-check" /> Selesai</span>;
    if (st === 'diproses') return <span className="badge badge-info"><i className="fa-solid fa-spinner fa-spin" /> Diproses</span>;
    return <span className="badge badge-warning"><i className="fa-solid fa-clock" /> Menunggu</span>;
  };

  return (
    <Layout title="Disposisi Surat">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Glass Toolbar */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Cari nomor surat, perihal, penerima, atau instruksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.25rem' }}
            />
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'rgba(241, 245, 249, 0.9)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            {['ALL', 'Menunggu', 'Diproses', 'Selesai'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              >
                {st === 'ALL'
                  ? 'Semua'
                  : st === 'Menunggu'
                  ? <><i className="fa-solid fa-clock" /> Menunggu</>
                  : st === 'Diproses'
                  ? <><i className="fa-solid fa-bolt" /> Diproses</>
                  : <><i className="fa-solid fa-check" /> Selesai</>}
              </button>
            ))}
          </div>

          <button onClick={() => navigate('/disposisi/tambah')} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
            <i className="fa-solid fa-plus" /> Buat Disposisi
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
          <LoadingSpinner variant="inline" text="Memuat data disposisi…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="fa-clipboard-list"
            title="Belum Ada Disposisi"
            description={search || statusFilter !== 'ALL' ? 'Tidak ada disposisi yang sesuai dengan kriteria filter.' : 'Belum ada surat yang didisposisikan.'}
            actionLink="/disposisi/tambah"
            actionText="Buat Disposisi Surat"
          />
        ) : (
          <div className="table-container glass-card">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Surat Masuk</th>
                  <th>Pengirim → Penerima</th>
                  <th>Instruksi / Catatan</th>
                  <th>Sifat</th>
                  <th>Batas Waktu</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-light)' }}>{i + 1}</td>
                    <td>
                      {item.surat_masuk ? (
                        <div>
                          <Link to={`/surat-masuk/${item.surat_masuk.id}`} style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
                            {item.surat_masuk.nomor_surat}
                          </Link>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.surat_masuk.perihal}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-light)' }}>Surat tidak ada</span>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {item.pengirim?.full_name || 'Sistem'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <i className="fa-solid fa-arrow-right-long" /> {item.penerima?.full_name || '-'} ({item.penerima?.jabatan || item.penerima?.role || 'Staff'})
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.instruksi}</div>
                      {item.catatan && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Catatan: {item.catatan}</div>}
                    </td>
                    <td>{getSifatBadge(item.sifat)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(item.batas_waktu)}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {getStatusBadge(item.status)}
                        <select
                          value={item.status || 'Menunggu'}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="input-field"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: 'auto' }}
                        >
                          <option value="Menunggu">Menunggu</option>
                          <option value="Diproses">Diproses</option>
                          <option value="Selesai">Selesai</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <Link to={`/disposisi/${item.id}/edit`} className="btn btn-secondary btn-sm" style={{ color: 'var(--warning)', borderColor: 'var(--warning-border)' }}>
                          <i className="fa-solid fa-pen-to-square" /> Edit
                        </Link>
                        <button
                          onClick={() => openDeleteModal(item.id, item.surat_masuk?.perihal)}
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
        title="Hapus Disposisi"
        message={`Apakah Anda yakin ingin menghapus disposisi ini? Data yang dihapus tidak dapat dikembalikan.`}
        confirmText="Hapus Disposisi"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        loading={deleting}
      />
    </Layout>
  );
}
