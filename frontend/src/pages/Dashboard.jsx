import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Cek apakah ada user di localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (!storedUser || !token) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Surat App Dashboard</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </header>
      <main style={styles.main}>
        <h3>Selamat datang, {user.full_name}!</h3>
        <p>Email: {user.email}</p>
        <p>Role: {user.role || 'Staff'}</p>
        {user.jabatan && <p>Jabatan: {user.jabatan}</p>}
      </main>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1f2937',
    color: 'white',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  main: {
    padding: '2rem',
  }
};
