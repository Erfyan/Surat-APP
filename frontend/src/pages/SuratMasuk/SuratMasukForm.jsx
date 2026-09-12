import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
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
      <div className="glass-card animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }} className="title-gradient">
          <i className="fa-solid fa-inbox" style={{ color: 'var(--primary)' }} /> Form Registrasi Surat Masuk
        </h3>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.875rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-triangle-exclamation" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Nomor Surat */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Nomor Surat <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                name="nomor_surat"
                value={form.nomor_surat}
                onChange={handleChange}
                placeholder="Contoh: 001/DU/IX/2026"
                className="input-field"
              />
            </div>

            {/* Asal Surat */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Asal Surat <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                name="asal_surat"
                value={form.asal_surat}
                onChange={handleChange}
                placeholder="Contoh: Kementerian Dalam Negeri"
                className="input-field"
              />
            </div>

            {/* Tanggal Surat */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tanggal Surat <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="date"
                name="tanggal_surat"
                value={form.tanggal_surat}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Tanggal Diterima */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tanggal Diterima</label>
              <input
                type="date"
                name="tanggal_diterima"
                value={form.tanggal_diterima}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Perihal */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Perihal <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea
              name="perihal"
              value={form.perihal}
              onChange={handleChange}
              placeholder="Deskripsi singkat tentang isi surat..."
              rows={3}
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Lampiran File */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              <i className="fa-solid fa-paperclip" /> Lampiran File Dokumen
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="input-field"
              style={{ padding: '0.5rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>Format: PDF, JPG, PNG — Maksimal 5MB</span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.875rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button
              type="button"
              onClick={() => navigate('/surat-masuk')}
              className="btn btn-secondary"
            >
              Batal
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <><LoadingSpinner variant="button" /> Menyimpan...</> : <><i className="fa-solid fa-floppy-disk" /> Simpan Surat</>}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
