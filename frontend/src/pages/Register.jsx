import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: '#e2e8f0', width: '0%' };
    if (pass.length < 6) return { score: 1, text: 'Terlalu Pendek (Min 6)', color: 'var(--danger)', width: '25%' };
    
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 2, text: 'Lemah', color: 'var(--warning)', width: '50%' };
    if (score === 3) return { score: 3, text: 'Sedang', color: '#3b82f6', width: '75%' };
    return { score: 4, text: 'Sangat Kuat', color: 'var(--success)', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      const msg = 'Password minimal 6 karakter';
      setError(msg);
      addToast(msg, 'warning');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registrasi gagal');
      }

      addToast('Registrasi akun berhasil! Silakan login.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-app-gradient)' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem', border: '1px solid var(--border-glass)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="sidebar-brand-icon" style={{ margin: '0 auto 1rem', width: '60px', height: '60px', fontSize: '1.85rem', background: 'var(--accent-orange-gradient)' }}>
            <i className="fa-solid fa-user-plus" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--primary)' }}>Daftar Akun Baru</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Bergabung dengan Sistem Persuratan Digital</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem 1rem', marginBottom: '1.25rem', justifyContent: 'center', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '0.4rem' }} /> {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              <i className="fa-solid fa-user" style={{ color: 'var(--primary)' }} /> Nama Lengkap
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
              className="input-field"
              placeholder="Budi Santoso"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              <i className="fa-solid fa-envelope" style={{ color: 'var(--primary)' }} /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="pegawai@instansi.go.id"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              <i className="fa-solid fa-lock" style={{ color: 'var(--primary)' }} /> Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                aria-label="Toggle Password Visibility"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>

            {password && (
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

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem', background: 'var(--accent-orange-gradient)' }}>
            {loading ? <><LoadingSpinner variant="button" /> Memproses...</> : <><i className="fa-solid fa-user-check" /> Daftar Akun</>}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Login di sini</Link>
        </div>
      </div>
    </div>
  );
}
