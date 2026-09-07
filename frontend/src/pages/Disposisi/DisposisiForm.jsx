import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  getSuratMasuk,
  getUsers,
  getDisposisiById,
  createDisposisi,
  updateDisposisi,
} from '../../services/api';

export default function DisposisiForm() {
  const { id } = useParams(); // Jika mode edit
  const [searchParams] = useSearchParams();
  const presetSuratId = searchParams.get('surat_id'); // Jika dipanggil dari Detail Surat Masuk
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
        // Ambil daftar surat masuk & daftar user
        const [suratRes, userRes] = await Promise.all([getSuratMasuk(), getUsers()]);

        if (suratRes.success) setSuratOptions(suratRes.data || []);
        if (userRes.success) setUserOptions(userRes.data || []);

        // Jika mode edit, ambil detail disposisi
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

      // Kembali ke detail surat jika ada presetSuratId, atau ke daftar disposisi
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
        <div style={styles.center}>Memuat data formulir…</div>
      </Layout>
    );
  }

  return (
    <Layout title={title}>
      <div style={styles.card}>
        <div style={styles.topBar}>
          <Link
            to={presetSuratId ? `/surat-masuk/${presetSuratId}` : '/disposisi'}
            style={styles.backLink}
          >
            ← Kembali
          </Link>
        </div>

        {error && <div style={styles.alertError}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Pilih Surat Masuk */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Pilih Surat Masuk *</label>
            <select
              name="surat_masuk_id"
              value={formData.surat_masuk_id}
              onChange={handleChange}
              disabled={isEdit || Boolean(presetSuratId)}
              style={styles.select}
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
          <div style={styles.grid2}>
            {/* Penerima Disposisi */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Penerima Disposisi *</label>
              <select
                name="penerima_id"
                value={formData.penerima_id}
                onChange={handleChange}
                style={styles.select}
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
            <div style={styles.formGroup}>
              <label style={styles.label}>Sifat Disposisi</label>
              <select
                name="sifat"
                value={formData.sifat}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Segera">Segera</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>
          </div>

          {/* Instruksi Disposisi */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Instruksi / Petunjuk *</label>
            <textarea
              name="instruksi"
              rows={3}
              value={formData.instruksi}
              onChange={handleChange}
              placeholder="Contoh: Tanggapi dan selesaikan, Siapkan bahan rapat, Mohon ditindaklanjuti..."
              style={styles.textarea}
              required
            />
          </div>

          {/* Catatan Tambahan */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Catatan Tambahan (Opsional)</label>
            <textarea
              name="catatan"
              rows={2}
              value={formData.catatan}
              onChange={handleChange}
              placeholder="Catatan tambahan untuk penerima..."
              style={styles.textarea}
            />
          </div>

          {/* Grid Dua Kolom untuk Batas Waktu & Status */}
          <div style={styles.grid2}>
            {/* Batas Waktu */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Batas Waktu Penyelesaian</label>
              <input
                type="date"
                name="batas_waktu"
                value={formData.batas_waktu}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            {/* Status Disposisi */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Status Disposisi</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Menunggu">Menunggu</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div style={styles.formActions}>
            <button
              type="button"
              onClick={() =>
                navigate(presetSuratId ? `/surat-masuk/${presetSuratId}` : '/disposisi')
              }
              style={styles.cancelBtn}
            >
              Batal
            </button>
            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Kirim Disposisi'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

const styles = {
  center: { textAlign: 'center', padding: '3rem', color: '#94a3b8' },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '2rem',
    maxWidth: '780px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  alertError: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#334155' },
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  input: {
    padding: '0.65rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    outline: 'none',
  },
  select: {
    padding: '0.65rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    backgroundColor: '#fff',
    outline: 'none',
  },
  textarea: {
    padding: '0.65rem 0.85rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
  },
  cancelBtn: {
    padding: '0.65rem 1.25rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
  submitBtn: {
    padding: '0.65rem 1.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
};
