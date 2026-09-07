import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SuratMasukList from './pages/SuratMasuk/SuratMasukList';
import SuratMasukForm from './pages/SuratMasuk/SuratMasukForm';
import SuratMasukDetail from './pages/SuratMasuk/SuratMasukDetail';
import DisposisiList from './pages/Disposisi/DisposisiList';
import DisposisiForm from './pages/Disposisi/DisposisiForm';
import SuratKeluarList from './pages/SuratKeluar/SuratKeluarList';
import SuratKeluarForm from './pages/SuratKeluar/SuratKeluarForm';
import SuratKeluarDetail from './pages/SuratKeluar/SuratKeluarDetail';
import ArsipList from './pages/Arsip/ArsipList';

// Guard: redirect ke /login jika belum terautentikasi
function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Surat Masuk */}
        <Route path="/surat-masuk" element={<PrivateRoute><SuratMasukList /></PrivateRoute>} />
        <Route path="/surat-masuk/tambah" element={<PrivateRoute><SuratMasukForm /></PrivateRoute>} />
        <Route path="/surat-masuk/:id" element={<PrivateRoute><SuratMasukDetail /></PrivateRoute>} />
        <Route path="/surat-masuk/:id/edit" element={<PrivateRoute><SuratMasukForm /></PrivateRoute>} />

        {/* Disposisi */}
        <Route path="/disposisi" element={<PrivateRoute><DisposisiList /></PrivateRoute>} />
        <Route path="/disposisi/tambah" element={<PrivateRoute><DisposisiForm /></PrivateRoute>} />
        <Route path="/disposisi/:id/edit" element={<PrivateRoute><DisposisiForm /></PrivateRoute>} />

        {/* Surat Keluar */}
        <Route path="/surat-keluar" element={<PrivateRoute><SuratKeluarList /></PrivateRoute>} />
        <Route path="/surat-keluar/tambah" element={<PrivateRoute><SuratKeluarForm /></PrivateRoute>} />
        <Route path="/surat-keluar/:id" element={<PrivateRoute><SuratKeluarDetail /></PrivateRoute>} />
        <Route path="/surat-keluar/:id/edit" element={<PrivateRoute><SuratKeluarForm /></PrivateRoute>} />

        {/* Arsip & Laporan */}
        <Route path="/arsip" element={<PrivateRoute><ArsipList /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}


export default App;
