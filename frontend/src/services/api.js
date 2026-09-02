/**
 * Helper terpusat untuk semua pemanggilan API ke backend.
 * Token JWT diambil otomatis dari localStorage.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ─── Surat Masuk ──────────────────────────────────────────────────────────────

export const getSuratMasuk = async () => {
  const res = await fetch(`${API_URL}/api/surat-masuk`, {
    headers: getHeaders(),
  });
  return res.json();
};

export const getSuratMasukById = async (id) => {
  const res = await fetch(`${API_URL}/api/surat-masuk/${id}`, {
    headers: getHeaders(),
  });
  return res.json();
};

export const createSuratMasuk = async (formData) => {
  // Menggunakan FormData karena mungkin ada lampiran file
  const res = await fetch(`${API_URL}/api/surat-masuk`, {
    method: 'POST',
    headers: getHeaders(), // jangan set Content-Type, biar browser set multipart boundary otomatis
    body: formData,
  });
  return res.json();
};

export const updateSuratMasuk = async (id, formData) => {
  const res = await fetch(`${API_URL}/api/surat-masuk/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: formData,
  });
  return res.json();
};

export const deleteSuratMasuk = async (id) => {
  const res = await fetch(`${API_URL}/api/surat-masuk/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
};
