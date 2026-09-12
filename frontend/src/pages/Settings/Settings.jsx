import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile, changeUserPassword } from '../../services/api';

const PRESETS = {
  pemerintah: {
    orgType: 'pemerintahan',
    parentName: 'PEMERINTAH KABUPATEN BOGOR',
    name: 'DINAS KOMUNIKASI DAN INFORMATIKA',
    subUnit: 'SEKRETARIAT & TATA USAHA PERSURATAN',
    tagline: 'Mewujudkan Tata Kelola Pemerintahan Berbasis Elektronik yang Akuntabel',
    address: 'Jl. Merdeka No. 45, Kompleks Perkantoran Pemerintah Daerah',
    city: 'Kab. Bogor, Jawa Barat 16911',
    phone: '(021) 555-0199',
    email: 'sekretariat@diskominfo.bogorkab.go.id',
    website: 'https://diskominfo.bogorkab.go.id',
    defaultLetterCode: 'DISKOMINFO',
    logoIcon: 'fa-landmark',
  },
  perusahaan: {
    orgType: 'perusahaan',
    parentName: 'HOLDING GROUP NUSANTARA',
    name: 'PT DIGITAL INOVASI KREATIF',
    subUnit: 'DIVISI OPERASIONAL & KORESPONDENSI BISNIS',
    tagline: 'Solusi Terdepan Ekosistem Teknologi & Layanan Digital Terintegrasi',
    address: 'Gedung Cyber Tower Lt. 18, Jl. H.R. Rasuna Said Kav. X-5',
    city: 'Jakarta Selatan, DKI Jakarta 12950',
    phone: '(021) 8088-9900',
    email: 'corporate.secretary@digitalinovasi.co.id',
    website: 'https://digitalinovasi.co.id',
    defaultLetterCode: 'DIK-CORP',
    logoIcon: 'fa-briefcase',
  },
  pendidikan: {
    orgType: 'pendidikan',
    parentName: 'YAYASAN PENDIDIKAN BINA BANGSA',
    name: 'UNIVERSITAS TEKNOLOGI NUSANTARA',
    subUnit: 'FAKULTAS ILMU KOMPUTER & TEKNOLOGI INFORMASI',
    tagline: 'Unggul dalam Riset, Berkarakter Luhur, dan Berdaya Saing Global',
    address: 'Kampus Terpadu, Jl. Pendidikan Karakter No. 100',
    city: 'Kota Bandung, Jawa Barat 40132',
    phone: '(022) 720-4321',
    email: 'dekanat.fik@utn.ac.id',
    website: 'https://utn.ac.id',
    defaultLetterCode: 'UTN-FIK',
    logoIcon: 'fa-graduation-cap',
  },
  yayasan: {
    orgType: 'yayasan',
    parentName: 'DEWAN PEMBINA PUSAT',
    name: 'YAYASAN KARYA PEDULI INDONESIA',
    subUnit: 'SEKRETARIAT JENDERAL & PELAYANAN SOSIAL',
    tagline: 'Bergerak Bersama Membangun Kesejahteraan Masyarakat Nusantara',
    address: 'Jl. Surya Kencana No. 88, Graha Kepedulian',
    city: 'Kota Surabaya, Jawa Timur 60271',
    phone: '(031) 567-8910',
    email: 'sekretariat@karyapeduli.org',
    website: 'https://karyapeduli.org',
    defaultLetterCode: 'YKPI-SKR',
    logoIcon: 'fa-hand-holding-heart',
  },
};

const LOGO_ICONS = [
  { id: 'fa-building-columns', label: 'Gedung Instansi' },
  { id: 'fa-landmark', label: 'Pemerintahan / Dinas' },
  { id: 'fa-briefcase', label: 'Perusahaan / Bisnis' },
  { id: 'fa-graduation-cap', label: 'Sekolah / Kampus' },
  { id: 'fa-hand-holding-heart', label: 'Yayasan / Sosial' },
  { id: 'fa-shield-halved', label: 'Keamanan / Hukum' },
  { id: 'fa-hospital', label: 'Kesehatan / RS' },
  { id: 'fa-users', label: 'Organisasi / Ormas' },
  { id: 'fa-feather-pointed', label: 'Persuratan Klasik' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const { addToast } = useToast();

  // Tab Profil State
  const [fullName, setFullName] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Tab Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Tab Identitas Instansi / Organisasi State
  const [institution, setInstitution] = useState(PRESETS.pemerintah);
  const [instLoading, setInstLoading] = useState(false);

  // Tab Preferensi State
  const [density, setDensity] = useState('normal');
  const [toastDuration, setToastDuration] = useState('3500');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        setFullName(u.full_name || '');
        setJabatan(u.jabatan || '');
      } catch (e) {
        console.error(e);
      }
    }

    const storedInst = localStorage.getItem('app_institution_settings');
    if (storedInst) {
      try {
        const parsed = JSON.parse(storedInst);
        setInstitution((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error(e);
      }
    }

    const storedDensity = localStorage.getItem('app_table_density');
    if (storedDensity) setDensity(storedDensity);

    const storedToast = localStorage.getItem('app_toast_duration');
    if (storedToast) setToastDuration(storedToast);
  }, []);

  const getPasswordStrength = (pass) => {
    if (!pass) return { text: '', color: '#e2e8f0', width: '0%' };
    if (pass.length < 6) return { text: 'Terlalu Pendek', color: 'var(--danger)', width: '25%' };

    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { text: 'Lemah', color: 'var(--warning)', width: '50%' };
    if (score === 3) return { text: 'Sedang', color: '#3b82f6', width: '75%' };
    return { text: 'Sangat Kuat', color: 'var(--success)', width: '100%' };
  };

  const strength = getPasswordStrength(newPassword);

  // 1. Simpan Profil
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast('Nama lengkap wajib diisi', 'warning');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await updateUserProfile({ full_name: fullName, jabatan });
      if (res && res.success) {
        const updatedUser = { ...user, full_name: fullName, jabatan };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        addToast('Profil berhasil diperbarui!', 'success');
      } else {
        throw new Error(res?.message || 'Gagal memperbarui profil');
      }
    } catch (err) {
      addToast(err.message || 'Gagal menyimpan profil', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // 2. Ganti Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('Password baru minimal 6 karakter', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Konfirmasi password tidak cocok!', 'warning');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changeUserPassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (res && res.success) {
        addToast('Kata sandi berhasil diperbarui!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(res?.message || 'Gagal mengubah kata sandi');
      }
    } catch (err) {
      addToast(err.message || 'Gagal mengubah password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 3. Simpan Identitas Instansi / Organisasi
  const handleSaveInstitution = (e) => {
    e.preventDefault();
    if (!institution.name || !institution.name.trim()) {
      addToast('Nama utama organisasi/instansi wajib diisi', 'warning');
      return;
    }

    setInstLoading(true);
    try {
      localStorage.setItem('app_institution_settings', JSON.stringify(institution));
      addToast('Identitas instansi/organisasi berhasil disimpan!', 'success');
    } catch (err) {
      addToast('Gagal menyimpan identitas instansi', 'error');
    } finally {
      setInstLoading(false);
    }
  };

  const applyPreset = (presetKey) => {
    if (PRESETS[presetKey]) {
      setInstitution(PRESETS[presetKey]);
      addToast(`Template ${PRESETS[presetKey].name} berhasil diterapkan!`, 'info');
    }
  };

  // 4. Simpan Preferensi
  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem('app_table_density', density);
    localStorage.setItem('app_toast_duration', toastDuration);
    addToast('Preferensi aplikasi disimpan!', 'success');
  };

  const tabs = [
    { id: 'profile', label: 'Profil Akun', icon: 'fa-user' },
    { id: 'security', label: 'Keamanan & Sandi', icon: 'fa-shield-halved' },
    { id: 'institution', label: 'Identitas Instansi / Organisasi', icon: 'fa-building-columns' },
    { id: 'preferences', label: 'Preferensi & Sistem', icon: 'fa-sliders' },
  ];

  return (
    <Layout title="Pengaturan & Preferensi">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Navigation Tabs Bar */}
        <div
          className="glass-card"
          style={{
            padding: '0.5rem',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                flex: 1,
                minWidth: '160px',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: activeTab === tab.id ? 700 : 500,
                transition: 'all 0.2s ease',
              }}
            >
              <i className={`fa-solid ${tab.icon}`} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Profil Akun */}
        {activeTab === 'profile' && (
          <div className="glass-card animate-fade-in" style={{ padding: '2rem', maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
                }}
              >
                {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-main)' }}>
                  {fullName || 'Nama Pengguna'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    <i className="fa-solid fa-user-shield" /> {user?.role || 'Staff'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email || ''}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  <i className="fa-solid fa-id-card" style={{ color: 'var(--primary)' }} /> Nama Lengkap <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  <i className="fa-solid fa-briefcase" style={{ color: 'var(--primary)' }} /> Jabatan / Posisi
                </label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="input-field"
                  placeholder="Contoh: Kepala Seksi Tata Usaha, Staff Administrasi"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  <i className="fa-solid fa-envelope" style={{ color: 'var(--primary)' }} /> Alamat Email (Terverifikasi)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field"
                  style={{ opacity: 0.7, background: 'rgba(0,0,0,0.05)', cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
                  Email terikat dengan otentikasi akun dan tidak dapat diubah sembarangan.
                </span>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button type="submit" disabled={profileLoading} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                  {profileLoading ? (
                    <><LoadingSpinner variant="button" /> Menyimpan...</>
                  ) : (
                    <><i className="fa-solid fa-floppy-disk" /> Simpan Perubahan Profil</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Keamanan & Sandi */}
        {activeTab === 'security' && (
          <div className="glass-card animate-fade-in" style={{ padding: '2rem', maxWidth: '650px' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.4rem', color: 'var(--primary)' }}>
                <i className="fa-solid fa-lock" /> Ganti Kata Sandi
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                Gunakan kombinasi minimal 6 karakter dengan huruf kapital, angka, dan simbol untuk keamanan maksimal.
              </p>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password Saat Ini</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-field"
                    placeholder="Masukkan password lama"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password"
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password Baru <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="input-field"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                {newPassword && (
                  <div className="password-strength-container">
                    <div className="password-strength-bar">
                      <div className="password-strength-fill" style={{ width: strength.width, backgroundColor: strength.color }} />
                    </div>
                    <div className="password-strength-text" style={{ color: strength.color }}>
                      Kekuatan: {strength.text}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Konfirmasi Password Baru <span style={{ color: 'var(--danger)' }}>*</span></label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="input-field"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button type="submit" disabled={passwordLoading} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-orange-gradient)' }}>
                  {passwordLoading ? (
                    <><LoadingSpinner variant="button" /> Memproses...</>
                  ) : (
                    <><i className="fa-solid fa-key" /> Perbarui Kata Sandi</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Identitas Instansi / Organisasi (Ultra Fleksibel) */}
        {activeTab === 'institution' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Form Input Identitas */}
            <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>
                    <i className="fa-solid fa-building-columns" /> Identitas Organisasi & Kop
                  </h3>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>Fleksibel & Multi-Sektor</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.4rem 0 0' }}>
                  Atur nama instansi, lembaga induk, slogan, kontak, dan logo untuk disesuaikan dengan jenis instansi atau organisasi Anda.
                </p>
              </div>

              {/* Template Cepat (Preset Selector) */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(30, 58, 138, 0.04)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <i className="fa-solid fa-wand-magic-sparkles" style={{ color: 'var(--accent-orange)' }} />
                  Gunakan Contoh Template Cepat:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => applyPreset('pemerintah')}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: '#fff' }}
                  >
                    <i className="fa-solid fa-landmark" style={{ color: '#1d4ed8' }} /> Pemerintahan / Dinas
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('perusahaan')}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: '#fff' }}
                  >
                    <i className="fa-solid fa-briefcase" style={{ color: '#ea580c' }} /> Perusahaan / PT / Swasta
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('pendidikan')}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: '#fff' }}
                  >
                    <i className="fa-solid fa-graduation-cap" style={{ color: '#059669' }} /> Sekolah / Universitas
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('yayasan')}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: '#fff' }}
                  >
                    <i className="fa-solid fa-hand-holding-heart" style={{ color: '#e11d48' }} /> Yayasan / LSM / Ormas
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveInstitution} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {/* Jenis Organisasi & Ikon Logo */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Jenis / Kategori Organisasi</label>
                    <select
                      value={institution.orgType || 'pemerintahan'}
                      onChange={(e) => setInstitution({ ...institution, orgType: e.target.value })}
                      className="input-field"
                    >
                      <option value="pemerintahan">Instansi Pemerintahan / Dinas</option>
                      <option value="perusahaan">Perusahaan / Korporasi / PT / CV</option>
                      <option value="pendidikan">Lembaga Pendidikan / Kampus / Sekolah</option>
                      <option value="yayasan">Yayasan / Lembaga Sosial / LSM</option>
                      <option value="organisasi">Organisasi Kemasyarakatan / Komunitas</option>
                      <option value="lainnya">Lainnya / Kustom</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Ikon Logo Kop Surat</label>
                    <select
                      value={institution.logoIcon || 'fa-building-columns'}
                      onChange={(e) => setInstitution({ ...institution, logoIcon: e.target.value })}
                      className="input-field"
                    >
                      {LOGO_ICONS.map((icon) => (
                        <option key={icon.id} value={icon.id}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tingkat 1: Lembaga Induk / Badan Pembina */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Nama Lembaga Induk / Badan Pembina <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={institution.parentName || ''}
                    onChange={(e) => setInstitution({ ...institution, parentName: e.target.value })}
                    className="input-field"
                    placeholder="Contoh: PEMERINTAH KABUPATEN BOGOR / YAYASAN AL-AZHAR"
                  />
                </div>

                {/* Tingkat 2: Nama Utama Instansi/Organisasi */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Nama Utama Instansi / Organisasi / Perusahaan <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={institution.name || ''}
                    onChange={(e) => setInstitution({ ...institution, name: e.target.value })}
                    required
                    className="input-field"
                    placeholder="Contoh: DINAS KOMUNIKASI DAN INFORMATIKA / PT DIGITAL INOVASI"
                  />
                </div>

                {/* Tingkat 3: Sub-Unit / Divisi / Bagian */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Unit Kerja / Bidang / Divisi / Jurusan <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={institution.subUnit || ''}
                    onChange={(e) => setInstitution({ ...institution, subUnit: e.target.value })}
                    className="input-field"
                    placeholder="Contoh: SEKRETARIAT & TATA USAHA / DIVISI HUMAN RESOURCE"
                  />
                </div>

                {/* Tagline / Slogan */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Tagline / Motto / Slogan <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={institution.tagline || ''}
                    onChange={(e) => setInstitution({ ...institution, tagline: e.target.value })}
                    className="input-field"
                    placeholder="Contoh: Mewujudkan Layanan Berbasis Elektronik yang Cepat dan Akurat"
                  />
                </div>

                {/* Alamat & Kota */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Alamat Lengkap Kantor</label>
                    <input
                      type="text"
                      value={institution.address || ''}
                      onChange={(e) => setInstitution({ ...institution, address: e.target.value })}
                      className="input-field"
                      placeholder="Contoh: Jl. Merdeka No. 45, Kompleks Perkantoran"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Kota / Kabupaten & Kode Pos</label>
                    <input
                      type="text"
                      value={institution.city || ''}
                      onChange={(e) => setInstitution({ ...institution, city: e.target.value })}
                      className="input-field"
                      placeholder="Contoh: Kab. Bogor, Jawa Barat 16911"
                    />
                  </div>
                </div>

                {/* Kontak: Telepon & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nomor Telepon / WhatsApp</label>
                    <input
                      type="text"
                      value={institution.phone || ''}
                      onChange={(e) => setInstitution({ ...institution, phone: e.target.value })}
                      className="input-field"
                      placeholder="(021) 555-0199 / 0812-xxxx"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email Resmi Korespondensi</label>
                    <input
                      type="email"
                      value={institution.email || ''}
                      onChange={(e) => setInstitution({ ...institution, email: e.target.value })}
                      className="input-field"
                      placeholder="sekretariat@organisasi.id"
                    />
                  </div>
                </div>

                {/* Website & Kode Penomoran Surat */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Website Resmi / Portal</label>
                    <input
                      type="text"
                      value={institution.website || ''}
                      onChange={(e) => setInstitution({ ...institution, website: e.target.value })}
                      className="input-field"
                      placeholder="https://organisasi.id"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Kode Singkat Surat (Default Format)</label>
                    <input
                      type="text"
                      value={institution.defaultLetterCode || ''}
                      onChange={(e) => setInstitution({ ...institution, defaultLetterCode: e.target.value })}
                      className="input-field"
                      placeholder="Contoh: DISKOMINFO / DIK-CORP / ORG"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <button type="submit" disabled={instLoading} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                    <i className="fa-solid fa-floppy-disk" /> Simpan Identitas Organisasi
                  </button>
                </div>
              </form>
            </div>

            {/* Live Interactive Kop Surat Preview */}
            <div className="glass-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    <i className="fa-solid fa-eye" style={{ color: 'var(--accent-orange)' }} /> Live Preview Kop Surat Resmi
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standar Dokumen Persuratan</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
                  Tampilan di bawah ini adalah representasi kop surat resmi saat dicetak pada lembar disposisi, surat keluar, atau rekapitulasi arsip.
                </p>
              </div>

              {/* Kertas Kop Surat Preview Sheet */}
              <div
                style={{
                  background: '#ffffff',
                  color: '#111827',
                  padding: '1.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  fontFamily: 'serif, "Times New Roman", Arial',
                }}
              >
                {/* Header Kop */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.75rem' }}>
                  {/* Logo Ikon */}
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      border: '2px solid #0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                      color: '#0f172a',
                      flexShrink: 0,
                    }}
                  >
                    <i className={`fa-solid ${institution.logoIcon || 'fa-building-columns'}`} />
                  </div>

                  {/* Header Texts */}
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    {institution.parentName && (
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#334155' }}>
                        {institution.parentName}
                      </div>
                    )}
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', color: '#0f172a', margin: '2px 0' }}>
                      {institution.name || 'NAMA UTAMA INSTANSI / ORGANISASI'}
                    </div>
                    {institution.subUnit && (
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569' }}>
                        {institution.subUnit}
                      </div>
                    )}
                    {institution.tagline && (
                      <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#64748b', marginTop: '2px' }}>
                        "{institution.tagline}"
                      </div>
                    )}
                    <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '4px', lineHeight: 1.4 }}>
                      <span>{institution.address || 'Alamat Lengkap Instansi'}</span>
                      {institution.city && <span>, {institution.city}</span>}
                      {institution.phone && <span> | Telp: {institution.phone}</span>}
                      {institution.email && <span> | Email: {institution.email}</span>}
                      {institution.website && <span> | Web: {institution.website}</span>}
                    </div>
                  </div>
                </div>

                {/* Garis Pembatas Kop Resmi (Double Line: 3px solid + 1px solid) */}
                <div style={{ borderTop: '3px solid #0f172a', borderBottom: '1px solid #0f172a', height: '4px', marginBottom: '1.25rem' }} />

                {/* Dummy Body Surat */}
                <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6, padding: '0 0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <div><strong>Nomor:</strong> 001/{institution.defaultLetterCode || 'KODE'}/III/{new Date().getFullYear()}</div>
                      <div><strong>Sifat:</strong> Penting / Segera</div>
                      <div><strong>Lampiran:</strong> 1 (Satu) Berkas</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>{institution.city?.split(',')[0] || 'Tempat'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                  </div>

                  <div style={{ margin: '1rem 0 0.5rem' }}>
                    <div><strong>Perihal:</strong> <span style={{ textDecoration: 'underline' }}>Pemberitahuan Korespondensi & Tata Naskah Dinas</span></div>
                  </div>

                  <p style={{ margin: '0.5rem 0', textAlign: 'justify' }}>
                    Dengan ini disampaikan bahwa seluruh dokumen surat masuk, surat keluar, lembar disposisi, dan rekapitulasi arsip digital telah terintegrasi secara otomatis dengan format identitas organisasi di atas.
                  </p>
                </div>
              </div>

              {/* Info Format Nomor Surat */}
              <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(30, 58, 138, 0.04)', border: '1px solid var(--border-light)', fontSize: '0.8rem' }}>
                <strong style={{ color: 'var(--primary)' }}>Pola Penomoran Otomatis:</strong>
                <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '4px' }}>
                  [URUT] / {institution.defaultLetterCode || 'KODE'} / [BULAN_ROMAWI] / [TAHUN]
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Preferensi & Sistem */}
        {activeTab === 'preferences' && (
          <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.4rem', color: 'var(--primary)' }}>
                <i className="fa-solid fa-sliders" /> Preferensi Tampilan & Status Sistem
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                Pengaturan preferensi antarmuka dan informasi kesehatan infrastruktur aplikasi.
              </p>
            </div>

            <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '650px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Durasi Notifikasi Toast (Popup)</label>
                <select
                  value={toastDuration}
                  onChange={(e) => setToastDuration(e.target.value)}
                  className="input-field"
                >
                  <option value="2500">2.5 Detik (Cepat)</option>
                  <option value="3500">3.5 Detik (Standar)</option>
                  <option value="5000">5.0 Detik (Lama)</option>
                </select>
              </div>

              <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-main)' }}>
                  <i className="fa-solid fa-circle-info" style={{ color: 'var(--primary)' }} /> Informasi Sistem Persuratan
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Versi Aplikasi:</span>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>v1.2.0 (Production Ready)</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Database & Auth:</span>
                    <div style={{ fontWeight: 700, color: 'var(--success)', marginTop: '2px' }}>
                      <i className="fa-solid fa-circle-check" /> Supabase Cloud Connected
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Keamanan Enkripsi:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>JWT + Helmet Secured</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Response Optimization:</span>
                    <div style={{ fontWeight: 700, color: 'var(--accent-orange)', marginTop: '2px' }}>Gzip Compression Active</div>
                  </div>
                </div>
              </div>

              <div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                  <i className="fa-solid fa-floppy-disk" /> Simpan Preferensi
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
