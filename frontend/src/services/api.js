/**
 * Helper terpusat untuk pemanggilan REST API ke backend.
 * Mengelola otentikasi JWT token, auto-refresh token, dan penanganan respons/error standar.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  const validToken = token && token !== 'undefined' && token !== 'null' ? token : null;
  return {
    ...(validToken ? { Authorization: `Bearer ${validToken}` } : {}),
  };
};

let isRefreshing = false;

/**
 * Memperbarui JWT Access Token menggunakan Refresh Token secara silent
 */
export const refreshSessionToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken || refreshToken === 'undefined' || refreshToken === 'null') {
    return false;
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.data?.access_token) {
      localStorage.setItem('access_token', data.data.access_token);
      if (data.data.refresh_token) {
        localStorage.setItem('refresh_token', data.data.refresh_token);
      }
      return true;
    }
  } catch (err) {
    console.error('[SILENT_REFRESH_ERROR]:', err);
  }
  return false;
};

/**
 * Wrapper pembantu `fetch` dengan penanganan otomatis status HTTP non-2xx,
 * silent retry bila token expired, dan redirect bersih ke /login bila sesi habis.
 */
const handleResponse = async (res, retryOriginal) => {
  if (res.status === 401) {
    if (retryOriginal && !isRefreshing) {
      isRefreshing = true;
      const refreshed = await refreshSessionToken();
      isRefreshing = false;

      if (refreshed) {
        const retryRes = await retryOriginal();
        return handleResponse(retryRes);
      }
    }

    // Refresh gagal / tidak ada -> bersihkan sesi dan alihkan ke login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.replace('/login');
      return { success: false, message: 'Sesi berakhir, silakan login kembali.' };
    }
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = { success: false, message: 'Respons server tidak valid' };
  }

  if (!res.ok) {
    return {
      success: false,
      message: data?.message || 'Terjadi kesalahan pada server',
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
  const makeRequest = () => fetch(`${API_URL}/api/auth/users`, { headers: getHeaders() });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

// ─── Surat Masuk API ─────────────────────────────────────────────────────────

export const getSuratMasuk = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_URL}/api/surat-masuk?${query}` : `${API_URL}/api/surat-masuk`;
  const makeRequest = () => fetch(url, { headers: getHeaders() });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const getSuratMasukById = async (id) => {
  const makeRequest = () => fetch(`${API_URL}/api/surat-masuk/${id}`, { headers: getHeaders() });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const createSuratMasuk = async (formData) => {
  const makeRequest = () => fetch(`${API_URL}/api/surat-masuk`, { method: 'POST', headers: getHeaders(), body: formData });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const updateSuratMasuk = async (id, formData) => {
  const makeRequest = () => fetch(`${API_URL}/api/surat-masuk/${id}`, { method: 'PUT', headers: getHeaders(), body: formData });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const deleteSuratMasuk = async (id) => {
  const makeRequest = () => fetch(`${API_URL}/api/surat-masuk/${id}`, { method: 'DELETE', headers: getHeaders() });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

// ─── Disposisi API ───────────────────────────────────────────────────────────

export const getDisposisi = async (suratMasukId = null) => {
  const url = suratMasukId
    ? `${API_URL}/api/disposisi?surat_masuk_id=${suratMasukId}`
    : `${API_URL}/api/disposisi`;
  const makeRequest = () => fetch(url, { headers: getHeaders() });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const getDisposisiBySuratId = async (suratMasukId) => {
  const makeRequest = () => fetch(`${API_URL}/api/disposisi/surat/${suratMasukId}`, { headers: getHeaders() });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const getDisposisiById = async (id) => {
  const makeRequest = () => fetch(`${API_URL}/api/disposisi/${id}`, { headers: getHeaders() });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const createDisposisi = async (disposisiData) => {
  const makeRequest = () => fetch(`${API_URL}/api/disposisi`, {
    method: 'POST',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(disposisiData),
  });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const updateDisposisi = async (id, disposisiData) => {
  const makeRequest = () => fetch(`${API_URL}/api/disposisi/${id}`, {
    method: 'PUT',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(disposisiData),
  });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const deleteDisposisi = async (id) => {
  const makeRequest = () => fetch(`${API_URL}/api/disposisi/${id}`, { method: 'DELETE', headers: getHeaders() });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

// ─── Surat Keluar API ────────────────────────────────────────────────────────

export const getSuratKeluar = async (status = null) => {
  const url = status
    ? `${API_URL}/api/surat-keluar?status=${encodeURIComponent(status)}`
    : `${API_URL}/api/surat-keluar`;
  const makeRequest = () => fetch(url, { headers: getHeaders() });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const getSuratKeluarById = async (id) => {
  const makeRequest = () => fetch(`${API_URL}/api/surat-keluar/${id}`, { headers: getHeaders() });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const createSuratKeluar = async (formData) => {
  const makeRequest = () => fetch(`${API_URL}/api/surat-keluar`, { method: 'POST', headers: getHeaders(), body: formData });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const updateSuratKeluar = async (id, formData) => {
  const makeRequest = () => fetch(`${API_URL}/api/surat-keluar/${id}`, { method: 'PUT', headers: getHeaders(), body: formData });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const approveSuratKeluar = async (id, status_approval, catatan_approval) => {
  const makeRequest = () => fetch(`${API_URL}/api/surat-keluar/${id}/approval`, {
    method: 'PUT',
    headers: { ...getHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ status_approval, catatan_approval }),
  });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};

export const deleteSuratKeluar = async (id) => {
  const makeRequest = () => fetch(`${API_URL}/api/surat-keluar/${id}`, { method: 'DELETE', headers: getHeaders() });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
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

  const makeRequest = () => fetch(url, { headers: getHeaders() });
  const res = await makeRequest();
  return handleResponse(res, makeRequest);
};
