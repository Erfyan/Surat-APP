import { useEffect, useState } from 'react';

/**
 * Modal Cetak Lembar Disposisi Resmi Standar Instansi/Organisasi
 */
export default function DisposisiPrintModal({ isOpen, onClose, disposisi }) {
  const [institution, setInstitution] = useState(null);

  useEffect(() => {
    const storedInst = localStorage.getItem('app_institution_settings');
    if (storedInst) {
      try {
        setInstitution(JSON.parse(storedInst));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  if (!isOpen || !disposisi) return null;

  const surat = disposisi.surat_masuk || {};
  const pengirim = disposisi.pengirim || {};
  const penerima = disposisi.penerima || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const sifatList = ['Biasa', 'Penting', 'Segera', 'Rahasia'];
  const standarInstruksi = [
    'Tindak lanjuti & selesaikan',
    'Tanggapi / Balas tertulis',
    'Pelajari & beri saran/rekomendasi',
    'Hadiri / Wakili pimpinan',
    'Koordinasikan dengan bidang terkait',
    'Arsipkan / Simpan sebagai referensi',
  ];

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Actions (No-print) */}
        <div
          className="no-print"
          style={{
            padding: '1rem 1.5rem',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="fa-solid fa-print" style={{ fontSize: '1.2rem', color: 'var(--accent-orange)' }} />
            <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Pratinjau Cetak Lembar Disposisi</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ background: 'var(--accent-orange-gradient)', border: 'none', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <i className="fa-solid fa-print" /> Cetak Lembar (Print)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              style={{ color: '#fff', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            >
              <i className="fa-solid fa-xmark" /> Tutup
            </button>
          </div>
        </div>

        {/* Printable Disposisi Sheet Content */}
        <div
          id="disposisi-print-sheet"
          style={{
            padding: '2rem',
            overflowY: 'auto',
            fontFamily: 'serif, "Times New Roman", Arial',
            fontSize: '10.5pt',
            lineHeight: 1.4,
            backgroundColor: '#ffffff',
          }}
        >
          {/* 1. Kop Surat Resmi */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            {institution?.parentName && (
              <div style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', color: '#1e293b' }}>
                {institution.parentName}
              </div>
            )}
            <div style={{ fontSize: '14pt', fontWeight: 900, textTransform: 'uppercase', color: '#0f172a', margin: '2px 0' }}>
              {institution?.name || 'DINAS KOMUNIKASI DAN INFORMATIKA'}
            </div>
            {institution?.subUnit && (
              <div style={{ fontSize: '10.5pt', fontWeight: 700, textTransform: 'uppercase', color: '#334155' }}>
                {institution.subUnit}
              </div>
            )}
            <div style={{ fontSize: '8.5pt', color: '#475569', marginTop: '3px' }}>
              {institution?.address || 'Jl. Merdeka No. 45, Kompleks Perkantoran'} {institution?.city && `| ${institution.city}`} {institution?.phone && `| Telp: ${institution.phone}`} {institution?.email && `| Email: ${institution.email}`}
            </div>
            {/* Double underline border kop */}
            <div style={{ borderTop: '3px solid #000', borderBottom: '1px solid #000', height: '4px', margin: '8px 0 14px 0' }} />
          </div>

          {/* 2. Judul Lembar */}
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '13pt', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'underline' }}>
              LEMBAR DISPOSISI
            </h3>
            <div style={{ fontSize: '9pt', color: '#64748b', marginTop: '2px' }}>
              Perhatian: Lembar ini tidak boleh dipisahkan dari berkas surat masuk yang bersangkutan.
            </div>
          </div>

          {/* 3. Tabel Detail Surat Masuk */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1.5px solid #000',
              marginBottom: '12px',
              fontSize: '10pt',
            }}
          >
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '22%', fontWeight: 700, background: '#f8fafc' }}>
                  Surat Dari
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '40%' }}>
                  {surat.pengirim || '-'}
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '18%', fontWeight: 700, background: '#f8fafc' }}>
                  No. Agenda
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '20%', fontWeight: 700 }}>
                  {surat.nomor_agenda || '-'}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 700, background: '#f8fafc' }}>
                  Nomor Surat
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                  {surat.nomor_surat || '-'}
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 700, background: '#f8fafc' }}>
                  Tgl. Diterima
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                  {formatDate(surat.tanggal_terima || surat.created_at)}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 700, background: '#f8fafc' }}>
                  Tanggal Surat
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                  {formatDate(surat.tanggal_surat)}
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 700, background: '#f8fafc' }}>
                  Sifat Surat
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '8.5pt' }}>
                    {sifatList.map((s) => {
                      const isMatch = (disposisi.sifat || surat.sifat || '').toLowerCase() === s.toLowerCase();
                      return (
                        <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: isMatch ? 700 : 400 }}>
                          [{isMatch ? '✓' : ' '}] {s}
                        </span>
                      );
                    })}
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 700, background: '#f8fafc' }}>
                  Perihal
                </td>
                <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 600 }}>
                  {surat.perihal || '-'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* 4. Bagian Penerima & Instruksi Disposisi */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1.5px solid #000',
              marginBottom: '14px',
              fontSize: '10pt',
            }}
          >
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ border: '1px solid #000', padding: '6px 8px', width: '45%', textAlign: 'left' }}>
                  DITERUSKAN KEPADA:
                </th>
                <th style={{ border: '1px solid #000', padding: '6px 8px', width: '55%', textAlign: 'left' }}>
                  PETUNJUK / INSTRUKSI DISPOSISI:
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* Kolom Penerima */}
                <td style={{ border: '1px solid #000', padding: '10px 8px', verticalAlign: 'top' }}>
                  <div style={{ fontSize: '11pt', fontWeight: 800, color: '#0f172a' }}>
                    1. {penerima.full_name || 'Pejabat Terkait'}
                  </div>
                  <div style={{ fontSize: '9pt', color: '#475569', marginLeft: '12px' }}>
                    Jabatan: {penerima.jabatan || penerima.role || 'Staf Pelaksana'}
                  </div>
                  <div style={{ marginTop: '14px', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', fontSize: '9pt', color: '#64748b' }}>
                    <div>2. ..............................................................</div>
                    <div style={{ marginTop: '6px' }}>3. ..............................................................</div>
                  </div>
                </td>

                {/* Kolom Checklist Instruksi */}
                <td style={{ border: '1px solid #000', padding: '8px 10px', verticalAlign: 'top' }}>
                  {/* Instruksi Utama Disposisi */}
                  {disposisi.instruksi && (
                    <div style={{ padding: '4px 6px', background: '#e0f2fe', borderRadius: '4px', marginBottom: '8px', border: '1px solid #bae6fd' }}>
                      <strong style={{ color: '#0369a1' }}>Instruksi Khusus:</strong> {disposisi.instruksi}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3px', fontSize: '9pt' }}>
                    {standarInstruksi.map((ins, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'default' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '11pt' }}>[ ]</span>
                        <span>{ins}</span>
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', background: '#fafafa' }}>
                  <strong>Catatan / Arahan Tambahan:</strong>
                  <div style={{ minHeight: '36px', marginTop: '4px', fontSize: '9.5pt', color: '#334155' }}>
                    {disposisi.catatan || 'Segera laksanakan sesuai dengan petunjuk dan laporkan hasilnya.'}
                  </div>
                  {disposisi.batas_waktu && (
                    <div style={{ marginTop: '6px', fontSize: '8.5pt', color: '#b91c1c', fontWeight: 700 }}>
                      * Batas Waktu Penyelesaian: {formatDate(disposisi.batas_waktu)}
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* 5. Kolom Tanda Tangan & Paraf */}
          <table style={{ width: '100%', marginTop: '10px', fontSize: '9.5pt', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top', padding: '0 1rem' }}>
                  <div>Tanda Tangan / Paraf Penerima,</div>
                  <div style={{ height: '55px' }} />
                  <div style={{ fontWeight: 800, textDecoration: 'underline' }}>
                    ( {penerima.full_name || '...........................................'} )
                  </div>
                  <div style={{ fontSize: '8.5pt', color: '#64748b' }}>
                    NIP / Jabatan: {penerima.jabatan || 'Penerima Disposisi'}
                  </div>
                </td>

                <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top', padding: '0 1rem' }}>
                  <div>
                    {institution?.city?.split(',')[0] || 'Ditetapkan di Tempat'}, {formatDate(disposisi.created_at || new Date().toISOString())}
                  </div>
                  <div style={{ fontWeight: 700 }}>Pemberi Disposisi / Pimpinan,</div>
                  <div style={{ height: '55px' }} />
                  <div style={{ fontWeight: 800, textDecoration: 'underline' }}>
                    ( {pengirim.full_name || 'Pimpinan Instansi'} )
                  </div>
                  <div style={{ fontSize: '8.5pt', color: '#64748b' }}>
                    {pengirim.jabatan || 'Kepala / Pimpinan'}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
