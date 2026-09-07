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

export const getSuratMasuk = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_URL}/api/surat-masuk?${query}` : `${API_URL}/api/surat-masuk`;
  const res = await fetch(url, {
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

// ─── Users / Profiles ─────────────────────────────────────────────────────────

export const getUsers = async () => {
  const res = await fetch(`${API_URL}/api/auth/users`, {
    headers: getHeaders(),
  });
  return res.json();
};

// ─── Disposisi ────────────────────────────────────────────────────────────────

export const getDisposisi = async (suratMasukId = null) => {
  const url = suratMasukId
    ? `${API_URL}/api/disposisi?surat_masuk_id=${suratMasukId}`
    : `${API_URL}/api/disposisi`;
  const res = await fetch(url, {
    headers: getHeaders(),
  });
  return res.json();
};

export const getDisposisiBySuratId = async (suratMasukId) => {
  const res = await fetch(`${API_URL}/api/disposisi/surat/${suratMasukId}`, {
    headers: getHeaders(),
  });
  return res.json();
};

export const getDisposisiById = async (id) => {
  const res = await fetch(`${API_URL}/api/disposisi/${id}`, {
    headers: getHeaders(),
  });
  return res.json();
};

export const createDisposisi = async (disposisiData) => {
  const res = await fetch(`${API_URL}/api/disposisi`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(disposisiData),
  });
  return res.json();
};

export const updateDisposisi = async (id, disposisiData) => {
  const res = await fetch(`${API_URL}/api/disposisi/${id}`, {
    method: 'PUT',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(disposisiData),
  });
  return res.json();
};

export const deleteDisposisi = async (id) => {
  const res = await fetch(`${API_URL}/api/disposisi/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
};

// ─── Surat Keluar ─────────────────────────────────────────────────────────────

export const getSuratKeluar = async (status = null) => {
  const url = status
    ? `${API_URL}/api/surat-keluar?status=${encodeURIComponent(status)}`
    : `${API_URL}/api/surat-keluar`;
  const res = await fetch(url, {
    headers: getHeaders(),
  });
  return res.json();
};

export const getSuratKeluarById = async (id) => {
  const res = await fetch(`${API_URL}/api/surat-keluar/${id}`, {
    headers: getHeaders(),
  });
  return res.json();
};

export const createSuratKeluar = async (formData) => {
  const res = await fetch(`${API_URL}/api/surat-keluar`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });
  return res.json();
};

export const updateSuratKeluar = async (id, formData) => {
  const res = await fetch(`${API_URL}/api/surat-keluar/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: formData,
  });
  return res.json();
};

export const approveSuratKeluar = async (id, status_approval, catatan_approval) => {
  const res = await fetch(`${API_URL}/api/surat-keluar/${id}/approval`, {
    method: 'PUT',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status_approval, catatan_approval }),
  });
  return res.json();
};

export const deleteSuratKeluar = async (id) => {
  const res = await fetch(`${API_URL}/api/surat-keluar/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
};

// ─── Arsip & Laporan ─────────────────────────────────────────────────────────

export const getArsip = async (params = {}) => {
  // filtering out empty strings/nulls
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
      cleanParams[key] = params[key];
    }
  });

  const query = new URLSearchParams(cleanParams).toString();
  const url = query ? `${API_URL}/api/arsip?${query}` : `${API_URL}/api/arsip`;

  const res = await fetch(url, {
    headers: getHeaders(),
  });
  return res.json();
};



