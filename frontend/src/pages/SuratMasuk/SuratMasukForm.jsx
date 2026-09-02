import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { createSuratMasuk } from '../../services/api';

export default function SuratMasukForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nomor_surat: '',
    tanggal_surat: '',
    tanggal_diterima: '',
    asal_surat: '',
    perihal: '',
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nomor_surat || !form.tanggal_surat || !form.asal_surat || !form.perihal) {
      setError('Nomor surat, tanggal surat, asal surat, dan perihal wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      // Menggunakan FormData agar bisa mengirim file sekaligus
      const formData = new FormData();
      formData.append('nomor_surat', form.nomor_surat);
      formData.append('tanggal_surat', form.tanggal_surat);
      formData.append('tanggal_diterima', form.tanggal_diterima);
      formData.append('asal_surat', form.asal_surat);
      formData.append('perihal', form.perihal);
      if (file) formData.append('file', file);

      const res = await createSuratMasuk(formData);
      if (!res.success) throw new Error(res.message);

      navigate('/surat-masuk');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Tambah Surat Masuk">
      <div style={styles.card}>
        {error && <div style={styles.alertError}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            {/* Nomor Surat */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Nomor Surat <span style={styles.required}>*</span></label>
              <input
                name="nomor_surat"
                value={form.nomor_surat}
                onChange={handleChange}
                placeholder="Contoh: 001/DU/IX/2026"
                style={styles.input}
              />
            </div>

            {/* Asal Surat */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Asal Surat <span style={styles.required}>*</span></label>
              <input
                name="asal_surat"
                value={form.asal_surat}
                onChange={handleChange}
                placeholder="Contoh: Kementerian Dalam Negeri"
                style={styles.input}
              />
            </div>

            {/* Tanggal Surat */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Tanggal Surat <span style={styles.required}>*</span></label>
              <input
                type="date"
                name="tanggal_surat"
                value={form.tanggal_surat}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            {/* Tanggal Diterima */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Tanggal Diterima</label>
              <input
                type="date"
                name="tanggal_diterima"
                value={form.tanggal_diterima}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Perihal */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Perihal <span style={styles.required}>*</span></label>
            <textarea
              name="perihal"
              value={form.perihal}
              onChange={handleChange}
              placeholder="Deskripsi singkat tentang isi surat..."
              rows={3}
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </div>

          {/* Lampiran File */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Lampiran File</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
            <p style={styles.hint}>Format: PDF, JPG, PNG — Maksimal 5MB</p>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate('/surat-masuk')}
              style={styles.cancelBtn}
            >
              Batal
            </button>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Menyimpan…' : '💾 Simpan'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '2rem',
    maxWidth: '780px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  alertError: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
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
    transition: 'border-color 0.15s',
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
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
};
