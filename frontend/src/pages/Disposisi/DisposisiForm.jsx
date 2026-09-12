import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  getSuratMasuk,
  getUsers,
  getDisposisiById,
  createDisposisi,
  updateDisposisi,
} from '../../services/api';

export default function DisposisiForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const presetSuratId = searchParams.get('surat_id');
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [suratOptions, setSuratOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  const [formData, setFormData] = useState({
    surat_masuk_id: presetSuratId || '',
    penerima_id: '',
    sifat: 'Biasa',
    instruksi: '',
    catatan: '',
    batas_waktu: '',
    status: 'Menunggu',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        const [suratRes, userRes] = await Promise.all([getSuratMasuk(), getUsers()]);

        if (suratRes.success) setSuratOptions(suratRes.data || []);
        if (userRes.success) setUserOptions(userRes.data || []);

        if (isEdit) {
          const dispRes = await getDisposisiById(id);
          if (!dispRes.success) throw new Error(dispRes.message);
          const data = dispRes.data;
          setFormData({
            surat_masuk_id: data.surat_masuk_id || '',
            penerima_id: data.penerima_id || '',
            sifat: data.sifat || 'Biasa',
            instruksi: data.instruksi || '',
            catatan: data.catatan || '',
            batas_waktu: data.batas_waktu ? data.batas_waktu.split('T')[0] : '',
            status: data.status || 'Menunggu',
          });
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat data formulir');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.surat_masuk_id) {
      alert('Pilih surat masuk terlebih dahulu!');
      return;
    }
    if (!formData.penerima_id) {
      alert('Pilih penerima disposisi!');
      return;
    }
    if (!formData.instruksi.trim()) {
      alert('Instruksi disposisi tidak boleh kosong!');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (isEdit) {
        const res = await updateDisposisi(id, formData);
        if (!res.success) throw new Error(res.message);
      } else {
        const res = await createDisposisi(formData);
        if (!res.success) throw new Error(res.message);
      }

      if (presetSuratId) {
        navigate(`/surat-masuk/${presetSuratId}`);
      } else {
        navigate('/disposisi');
      }
    } catch (err) {
      setError(err.message || 'Gagal menyimpan disposisi');
    } finally {
      setSubmitting(false);
    }
  };

  const title = isEdit ? 'Edit Disposisi Surat' : 'Buat Disposisi Baru';

  if (loading) {
    return (
      <Layout title={title}>
        <LoadingSpinner variant="page" text="Memuat data formulir…" />
      </Layout>
    );
  }

  return (
    <Layout title={title}>
      <div className="glass-card animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }} className="title-gradient">
            <i className="fa-solid fa-clipboard-list" style={{ color: 'var(--primary)' }} /> {title}
          </h3>
          <Link
            to={presetSuratId ? `/surat-masuk/${presetSuratId}` : '/disposisi'}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--primary)' }}
          >
            ← Kembali
          </Link>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.875rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-triangle-exclamation" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Pilih Surat Masuk */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Pilih Surat Masuk <span style={{ color: 'var(--danger)' }}>*</span></label>
            <select
              name="surat_masuk_id"
              value={formData.surat_masuk_id}
              onChange={handleChange}
              disabled={isEdit || Boolean(presetSuratId)}
              className="input-field"
              required
            >
              <option value="">-- Pilih Surat Masuk --</option>
              {suratOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomor_surat} - {s.perihal} ({s.asal_surat})
                </option>
              ))}
            </select>
          </div>

          {/* Grid Dua Kolom */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Penerima Disposisi */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Penerima Disposisi <span style={{ color: 'var(--danger)' }}>*</span></label>
              <select
                name="penerima_id"
                value={formData.penerima_id}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">-- Pilih Pegawai / Pejabat --</option>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} {u.jabatan ? `(${u.jabatan})` : `(${u.role || 'Staff'})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Sifat Disposisi */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Sifat Disposisi</label>
              <select
                name="sifat"
                value={formData.sifat}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Segera">Segera</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>
          </div>

          {/* Instruksi Disposisi */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Instruksi / Petunjuk <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea
              name="instruksi"
              rows={3}
              value={formData.instruksi}
              onChange={handleChange}
              placeholder="Contoh: Tanggapi dan selesaikan, Siapkan bahan rapat, Mohon ditindaklanjuti..."
              className="input-field"
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          {/* Catatan Tambahan */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Catatan Tambahan (Opsional)</label>
            <textarea
              name="catatan"
              rows={2}
              value={formData.catatan}
              onChange={handleChange}
              placeholder="Catatan tambahan untuk penerima..."
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Grid Dua Kolom untuk Batas Waktu & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Batas Waktu */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Batas Waktu Penyelesaian</label>
              <input
                type="date"
                name="batas_waktu"
                value={formData.batas_waktu}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Status Disposisi */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Status Disposisi</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Menunggu">Menunggu</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.875rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button
              type="button"
              onClick={() =>
                navigate(presetSuratId ? `/surat-masuk/${presetSuratId}` : '/disposisi')
              }
              className="btn btn-secondary"
            >
              Batal
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Menyimpan...' : <><i className="fa-solid fa-paper-plane" /> {isEdit ? 'Simpan Perubahan' : 'Kirim Disposisi'}</>}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
