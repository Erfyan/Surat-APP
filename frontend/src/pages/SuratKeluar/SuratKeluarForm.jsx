import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
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

  const handleGenerateNomorSurat = () => {
    const storedInst = localStorage.getItem('app_institution_settings');
    let letterCode = 'SK';
    if (storedInst) {
      try {
        const parsed = JSON.parse(storedInst);
        if (parsed.defaultLetterCode && parsed.defaultLetterCode.trim()) {
          letterCode = parsed.defaultLetterCode.trim();
        }
      } catch (e) {
        console.error(e);
      }
    }

    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const targetDate = form.tanggal_surat ? new Date(form.tanggal_surat) : new Date();
    const monthRoman = romanMonths[targetDate.getMonth()] || 'I';
    const year = targetDate.getFullYear();
    const randomSeq = String(Math.floor(Math.random() * 899) + 101);
    const generated = `${randomSeq}/${letterCode}/${monthRoman}/${year}`;

    setForm((prev) => ({ ...prev, nomor_surat: generated }));
  };

  const title = isEdit ? 'Edit Surat Keluar' : 'Buat Surat Keluar Baru';

  if (fetching) {
    return (
      <Layout title={title}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" /> Memuat data formulir...
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={title}>
      <div className="glass-card animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }} className="title-gradient">
            <i className="fa-solid fa-paper-plane" style={{ color: 'var(--success)' }} /> {title}
          </h3>
          <Link to="/surat-keluar" className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
            ← Kembali ke Daftar
          </Link>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.875rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            <i className="fa-solid fa-triangle-exclamation" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Nomor Surat */}
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Nomor Surat (Opsional)</label>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={handleGenerateNomorSurat}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', color: 'var(--primary)', height: 'auto' }}
                    title="Buat nomor otomatis berdasarkan format instansi"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--accent-orange)' }} /> Buat Otomatis
                  </button>
                )}
              </div>
              <input
                name="nomor_surat"
                value={form.nomor_surat}
                onChange={handleChange}
                placeholder="Contoh: 001/SK/IX/2026"
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
                required
              />
            </div>
          </div>

          {/* Tujuan Surat */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Tujuan Surat <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              name="tujuan_surat"
              value={form.tujuan_surat}
              onChange={handleChange}
              placeholder="Contoh: Dinas Pendidikan Kota Makassar"
              className="input-field"
              required
            />
          </div>

          {/* Perihal */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Perihal <span style={{ color: 'var(--danger)' }}>*</span></label>
            <textarea
              name="perihal"
              value={form.perihal}
              onChange={handleChange}
              placeholder="Perihal surat keluar..."
              rows={3}
              className="input-field"
              style={{ resize: 'vertical' }}
              required
            />
          </div>

          {/* Isi Ringkas */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Ringkasan Isi (Opsional)</label>
            <textarea
              name="isi_ringkas"
              value={form.isi_ringkas}
              onChange={handleChange}
              placeholder="Ringkasan singkat isi surat..."
              rows={2}
              className="input-field"
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Lampiran File */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              <i className="fa-solid fa-paperclip" /> Lampiran File Dokumen
            </label>
            {isEdit && existingFileUrl && (
              <div className="badge badge-info" style={{ marginBottom: '0.5rem', width: 'fit-content' }}>
                <i className="fa-solid fa-paperclip" /> File saat ini: <a href={existingFileUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>Lihat Lampiran</a>
              </div>
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={handleFileChange}
              className="input-field"
              style={{ padding: '0.5rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>Format: PDF, JPG, PNG, DOCX — Maksimal 5MB</span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.875rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button
              type="button"
              onClick={() => navigate('/surat-keluar')}
              className="btn btn-secondary"
            >
              Batal
            </button>
            <button type="submit" disabled={loading} className="btn btn-success">
              {loading ? <><LoadingSpinner variant="button" /> Menyimpan...</> : <><i className="fa-solid fa-floppy-disk" /> {isEdit ? 'Simpan Perubahan' : 'Simpan Draft'}</>}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
