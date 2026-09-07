import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getSuratKeluarById, createSuratKeluar, updateSuratKeluar } from '../../services/api';

export default function SuratKeluarForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nomor_surat: '',
    tanggal_surat: '',
    tujuan_surat: '',
    perihal: '',
    isi_ringkas: '',
  });
  const [file, setFile] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    const loadData = async () => {
      setFetching(true);
      try {
        const res = await getSuratKeluarById(id);
        if (!res.success) throw new Error(res.message);
        const d = res.data;
        setForm({
          nomor_surat: d.nomor_surat || '',
          tanggal_surat: d.tanggal_surat ? d.tanggal_surat.split('T')[0] : '',
          tujuan_surat: d.tujuan_surat || '',
          perihal: d.perihal || '',
          isi_ringkas: d.isi_ringkas || '',
        });
        setExistingFileUrl(d.file_url || null);
      } catch (err) {
        setError(err.message || 'Gagal memuat data surat keluar');
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.tanggal_surat || !form.tujuan_surat || !form.perihal) {
      setError('Tanggal surat, tujuan surat, dan perihal wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nomor_surat', form.nomor_surat);
      formData.append('tanggal_surat', form.tanggal_surat);
      formData.append('tujuan_surat', form.tujuan_surat);
      formData.append('perihal', form.perihal);
      formData.append('isi_ringkas', form.isi_ringkas);
      if (file) formData.append('file', file);

      let res;
      if (isEdit) {
        res = await updateSuratKeluar(id, formData);
      } else {
        res = await createSuratKeluar(formData);
      }

      if (!res.success) throw new Error(res.message);

      navigate('/surat-keluar');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  const title = isEdit ? 'Edit Surat Keluar' : 'Buat Surat Keluar Baru';

  if (fetching) {
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
          <Link to="/surat-keluar" style={styles.backLink}>
            ← Kembali ke Daftar
          </Link>
        </div>

        {error && <div style={styles.alertError}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            {/* Nomor Surat */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nomor Surat</label>
              <input
                name="nomor_surat"
                value={form.nomor_surat}
                onChange={handleChange}
                placeholder="Contoh: 001/SK/IX/2026 (opsional, bisa diisi setelah disetujui)"
                style={styles.input}
              />
            </div>

            {/* Tanggal Surat */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Tanggal Surat <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="tanggal_surat"
                value={form.tanggal_surat}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          {/* Tujuan Surat */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Tujuan Surat <span style={styles.required}>*</span>
            </label>
            <input
              name="tujuan_surat"
              value={form.tujuan_surat}
              onChange={handleChange}
              placeholder="Contoh: Dinas Pendidikan Kota Makassar"
              style={styles.input}
              required
            />
          </div>

          {/* Perihal */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Perihal <span style={styles.required}>*</span>
            </label>
            <textarea
              name="perihal"
              value={form.perihal}
              onChange={handleChange}
              placeholder="Perihal surat keluar..."
              rows={3}
              style={{ ...styles.input, resize: 'vertical', fontFamily: 'inherit' }}
              required
            />
          </div>

          {/* Isi Ringkas */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Ringkasan Isi (Opsional)</label>
            <textarea
              name="isi_ringkas"
              value={form.isi_ringkas}
              onChange={handleChange}
              placeholder="Ringkasan singkat isi surat..."
              rows={2}
              style={{ ...styles.input, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Lampiran File */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Lampiran File</label>
            {isEdit && existingFileUrl && (
              <div style={styles.existingFile}>
                📎 File saat ini:{' '}
                <a href={existingFileUrl} target="_blank" rel="noreferrer" style={styles.fileLink}>
                  Lihat Lampiran
                </a>
              </div>
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
            <p style={styles.hint}>Format: PDF, JPG, PNG, DOCX — Maksimal 5MB</p>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate('/surat-keluar')}
              style={styles.cancelBtn}
            >
              Batal
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Menyimpan…' : isEdit ? '💾 Simpan Perubahan' : '💾 Simpan Draft'}
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151',
  },
  required: { color: '#ef4444' },
  input: {
    padding: '0.65rem 0.9rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#1f2937',
    outline: 'none',
    backgroundColor: '#fff',
    width: '100%',
    boxSizing: 'border-box',
  },
  fileInput: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
  },
  existingFile: {
    fontSize: '0.8rem',
    color: '#475569',
    backgroundColor: '#f8fafc',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },
  fileLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
  hint: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    margin: '2px 0 0',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f1f5f9',
  },
  cancelBtn: {
    padding: '0.65rem 1.25rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#475569',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  submitBtn: {
    padding: '0.65rem 1.5rem',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
};
