import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      if (!data.success) {
        throw new Error(data.message || 'Email atau password salah');
      }

      // Simpan token & user info ke localStorage
      localStorage.setItem('access_token', data.data.access_token);
      if (data.data.refresh_token) {
        localStorage.setItem('refresh_token', data.data.refresh_token);
      }
      localStorage.setItem('user', JSON.stringify(data.data.user));

      addToast(`Selamat datang kembali, ${data.data.user.full_name}!`, 'success');

      // Redirect ke dashboard
      navigate('/');
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'var(--bg-app-gradient)' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem', border: '1px solid var(--border-glass)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="sidebar-brand-icon" style={{ margin: '0 auto 1rem', width: '60px', height: '60px', fontSize: '1.85rem', background: 'var(--accent-orange-gradient)' }}>
            <i className="fa-solid fa-envelope-open-text" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--primary)' }}>Login Surat App</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sistem Tata Kelola Persuratan Digital</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem 1rem', marginBottom: '1.25rem', justifyContent: 'center', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '0.4rem' }} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">
              <i className="fa-solid fa-envelope" style={{ color: 'var(--primary)' }} /> Email Instansi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
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
                placeholder="********"
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
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            {loading ? <><LoadingSpinner variant="button" /> Memproses...</> : <><i className="fa-solid fa-right-to-bracket" /> Masuk</>}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Belum punya akun? <Link to="/register" style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>Daftar di sini</Link>
        </div>
      </div>
    </div>
  );
}
