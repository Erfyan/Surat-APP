import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';
import { getSuratMasuk, deleteSuratMasuk } from '../../services/api';

export default function SuratMasukList() {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, nomor: '' });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSuratMasuk({ search, startDate, endDate });
      if (!res.success) throw new Error(res.message);
      setSuratList(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data surat masuk');
      addToast(err.message || 'Gagal memuat data surat masuk', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openDeleteModal = (id, nomor) => {
    setDeleteModal({ isOpen: true, id, nomor });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null, nomor: '' });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      const res = await deleteSuratMasuk(deleteModal.id);
      if (!res.success) throw new Error(res.message);
      setSuratList((prev) => prev.filter((s) => s.id !== deleteModal.id));
      addToast(`Surat Masuk "${deleteModal.nomor}" berhasil dihapus.`, 'success');
      closeDeleteModal();
    } catch (err) {
      addToast('Gagal menghapus: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
    <Layout title="Surat Masuk">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Glass Toolbar */}
        <form onSubmit={handleSearchSubmit} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 2, minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Cari nomor, asal, perihal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.25rem' }}
            />
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          </div>

          <input
            type="date"
            title="Dari Tanggal"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
            style={{ width: 'auto' }}
          />
          <input
            type="date"
            title="Sampai Tanggal"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
            style={{ width: 'auto' }}
          />
          <button type="submit" className="btn btn-primary">
            <i className="fa-solid fa-magnifying-glass" /> Cari
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStartDate('');
              setEndDate('');
              setTimeout(fetchData, 50);
            }}
            className="btn btn-secondary"
          >
            <i className="fa-solid fa-rotate-left" /> Reset
          </button>
          <button type="button" onClick={() => navigate('/surat-masuk/tambah')} className="btn btn-success" style={{ marginLeft: 'auto' }}>
            <i className="fa-solid fa-plus" /> Tambah Surat
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.875rem 1.25rem', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-triangle-exclamation" /> {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <LoadingSpinner variant="inline" text="Memuat data surat masuk…" />
        ) : suratList.length === 0 ? (
          <EmptyState
            icon="fa-inbox"
            title="Belum Ada Surat Masuk"
            description={search || startDate || endDate ? 'Tidak ada surat masuk yang cocok dengan kriteria pencarian.' : 'Belum ada surat masuk terarsip di sistem.'}
            actionLink="/surat-masuk/tambah"
            actionText="Tambah Surat Masuk"
          />
        ) : (
          <div className="table-container glass-card">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nomor Surat</th>
                  <th>Tanggal</th>
                  <th>Asal Surat</th>
                  <th>Perihal</th>
                  <th>Lampiran</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {suratList.map((surat, i) => (
                  <tr key={surat.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-light)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      <Link to={`/surat-masuk/${surat.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                        {surat.nomor_surat}
                      </Link>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(surat.tanggal_surat)}</td>
                    <td style={{ fontWeight: 600 }}>{surat.asal_surat}</td>
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
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <Link to={`/surat-masuk/${surat.id}`} className="btn btn-secondary btn-sm">
                          <i className="fa-solid fa-eye" /> Detail
                        </Link>
                        <Link to={`/surat-masuk/${surat.id}/edit`} className="btn btn-secondary btn-sm" style={{ color: 'var(--warning)', borderColor: 'var(--warning-border)' }}>
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
        title="Hapus Surat Masuk"
        message={`Apakah Anda yakin ingin menghapus surat masuk "${deleteModal.nomor}"? Data yang dihapus tidak dapat dikembalikan.`}
        confirmText="Hapus Surat"
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        loading={deleting}
      />
    </Layout>
  );
}
