import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile, changeUserPassword } from '../../services/api';

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

  // Tab Identitas Instansi State
  const [institution, setInstitution] = useState({
    name: 'Dinas Komunikasi dan Informatika',
    address: 'Jl. Merdeka No. 45, Kompleks Perkantoran Pemerintah',
    phone: '(021) 555-0199',
    email: 'sekretariat@instansi.go.id',
    website: 'https://instansi.go.id',
    defaultLetterCode: 'DISKOMINFO',
  });
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
        setInstitution(JSON.parse(storedInst));
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

  // 3. Simpan Identitas Instansi
  const handleSaveInstitution = (e) => {
    e.preventDefault();
    setInstLoading(true);
    try {
      localStorage.setItem('app_institution_settings', JSON.stringify(institution));
      addToast('Data identitas instansi berhasil disimpan!', 'success');
    } catch (err) {
      addToast('Gagal menyimpan identitas instansi', 'error');
    } finally {
      setInstLoading(false);
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
    { id: 'institution', label: 'Identitas Instansi', icon: 'fa-building-columns' },
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
                whiteSpace: 'nowrap',
              }}
            >
              <i className={`fa-solid ${tab.icon}`} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Profil Akun */}
        {activeTab === 'profile' && (
          <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
              <div
                className="user-avatar"
                style={{ width: '64px', height: '64px', fontSize: '1.6rem', background: 'var(--primary-gradient)' }}
              >
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>
                  {user?.full_name || 'Nama Pengguna'}
                </h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
                  {user?.email || 'email@instansi.go.id'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '8px' }}>
                  <span className="badge badge-info">{user?.role || 'Staff'}</span>
                  {user?.jabatan && <span className="badge badge-warning">{user?.jabatan}</span>}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  <i className="fa-solid fa-user" style={{ color: 'var(--primary)' }} /> Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Nama Lengkap dan Gelar"
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

        {/* Tab 3: Identitas Instansi */}
        {activeTab === 'institution' && (
          <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.4rem', color: 'var(--primary)' }}>
                <i className="fa-solid fa-building-columns" /> Identitas Instansi & Kop Surat
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                Informasi ini digunakan sebagai Kop Surat resmi pada cetak lembar disposisi dan rekapitulasi laporan arsip.
              </p>
            </div>

            <form onSubmit={handleSaveInstitution} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '700px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Nama Instansi / Lembaga</label>
                <input
                  type="text"
                  value={institution.name}
                  onChange={(e) => setInstitution({ ...institution, name: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Contoh: Dinas Komunikasi dan Informatika"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Alamat Kantor</label>
                <textarea
                  rows={2}
                  value={institution.address}
                  onChange={(e) => setInstitution({ ...institution, address: e.target.value })}
                  className="input-field"
                  placeholder="Alamat lengkap instansi, kota, dan kode pos"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Nomor Telepon / Fax</label>
                  <input
                    type="text"
                    value={institution.phone}
                    onChange={(e) => setInstitution({ ...institution, phone: e.target.value })}
                    className="input-field"
                    placeholder="(021) 555-0199"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Email Resmi Dinas</label>
                  <input
                    type="email"
                    value={institution.email}
                    onChange={(e) => setInstitution({ ...institution, email: e.target.value })}
                    className="input-field"
                    placeholder="sekretariat@instansi.go.id"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Website Resmi</label>
                  <input
                    type="text"
                    value={institution.website}
                    onChange={(e) => setInstitution({ ...institution, website: e.target.value })}
                    className="input-field"
                    placeholder="https://instansi.go.id"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Kode Instansi Default Penomoran</label>
                  <input
                    type="text"
                    value={institution.defaultLetterCode}
                    onChange={(e) => setInstitution({ ...institution, defaultLetterCode: e.target.value })}
                    className="input-field"
                    placeholder="DISKOMINFO"
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button type="submit" disabled={instLoading} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                  <i className="fa-solid fa-floppy-disk" /> Simpan Identitas Instansi
                </button>
              </div>
            </form>
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
