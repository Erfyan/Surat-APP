/**
 * Helper terpusat untuk pemanggilan REST API ke backend.
 * Mengelola otentikasi JWT token dan penanganan respons/error standar.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Wrapper pembantu `fetch` dengan penanganan otomatis status HTTP non-2xx
 * dan redirect ke /login bila token expired (401).
 */
const handleResponse = async (res) => {
  if (res.status === 401) {
    // Token kadaluwarsa / tidak sah -> bersihkan sesi dan alihkan ke login
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login';
    }
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = { success: false, message: 'Respons server tidak valid' };
  }

  if (!res.ok && data.message) {
    return {
      success: false,
      message: data.message,
      status: res.status,
    };
  }

  return data;
};

// ─── Auth API ────────────────────────────────────────────────────────────────

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const registerUser = async (email, password, full_name) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  });
  return handleResponse(res);
};

export const getUsers = async () => {
  const res = await fetch(`${API_URL}/api/auth/users`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
};

// ─── Surat Masuk API ─────────────────────────────────────────────────────────

export const getSuratMasuk = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_URL}/api/surat-masuk?${query}` : `${API_URL}/api/surat-masuk`;
  const res = await fetch(url, {
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const getSuratMasukById = async (id) => {
  const res = await fetch(`${API_URL}/api/surat-masuk/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const createSuratMasuk = async (formData) => {
  const res = await fetch(`${API_URL}/api/surat-masuk`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });
  return handleResponse(res);
};

export const updateSuratMasuk = async (id, formData) => {
  const res = await fetch(`${API_URL}/api/surat-masuk/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: formData,
  });
  return handleResponse(res);
};

export const deleteSuratMasuk = async (id) => {
  const res = await fetch(`${API_URL}/api/surat-masuk/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
};

// ─── Disposisi API ───────────────────────────────────────────────────────────

export const getDisposisi = async (suratMasukId = null) => {
  const url = suratMasukId
    ? `${API_URL}/api/disposisi?surat_masuk_id=${suratMasukId}`
    : `${API_URL}/api/disposisi`;
  const res = await fetch(url, {
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const getDisposisiBySuratId = async (suratMasukId) => {
  const res = await fetch(`${API_URL}/api/disposisi/surat/${suratMasukId}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const getDisposisiById = async (id) => {
  const res = await fetch(`${API_URL}/api/disposisi/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
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
  return handleResponse(res);
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
  return handleResponse(res);
};

export const deleteDisposisi = async (id) => {
  const res = await fetch(`${API_URL}/api/disposisi/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
};

// ─── Surat Keluar API ────────────────────────────────────────────────────────

export const getSuratKeluar = async (status = null) => {
  const url = status
    ? `${API_URL}/api/surat-keluar?status=${encodeURIComponent(status)}`
    : `${API_URL}/api/surat-keluar`;
  const res = await fetch(url, {
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const getSuratKeluarById = async (id) => {
  const res = await fetch(`${API_URL}/api/surat-keluar/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const createSuratKeluar = async (formData) => {
  const res = await fetch(`${API_URL}/api/surat-keluar`, {
    method: 'POST',
    headers: getHeaders(),
    body: formData,
  });
  return handleResponse(res);
};

export const updateSuratKeluar = async (id, formData) => {
  const res = await fetch(`${API_URL}/api/surat-keluar/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: formData,
  });
  return handleResponse(res);
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
  return handleResponse(res);
};

export const deleteSuratKeluar = async (id) => {
  const res = await fetch(`${API_URL}/api/surat-keluar/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
};

// ─── Arsip & Laporan API ─────────────────────────────────────────────────────

export const getArsip = async (params = {}) => {
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
  return handleResponse(res);
};
