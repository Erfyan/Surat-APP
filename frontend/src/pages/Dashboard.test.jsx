import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  getSuratMasuk: vi.fn(),
  getSuratKeluar: vi.fn(),
  getDisposisi: vi.fn(),
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'user',
      JSON.stringify({ full_name: 'Ahmad Supardi', role: 'pimpinan', jabatan: 'Kepala Dinas' })
    );
    localStorage.setItem('access_token', 'mock-token');
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

  it('renders welcome banner and statistics cards correctly', async () => {
    api.getSuratMasuk.mockResolvedValueOnce({
      success: true,
      data: [
        { id: 'sm1', nomor_surat: '001/SM', perihal: 'Surat Masuk 1', tanggal_surat: '2026-01-01' },
      ],
    });
    api.getSuratKeluar.mockResolvedValueOnce({
      success: true,
      data: [
        { id: 'sk1', nomor_surat: '001/SK', perihal: 'Surat Keluar 1', status_approval: 'Pending', tanggal_surat: '2026-01-02' },
      ],
    });
    api.getDisposisi.mockResolvedValueOnce({
      success: true,
      data: [
        { id: 'd1', status: 'Menunggu' },
      ],
    });

    renderComponent();

    expect(screen.getByText(/Selamat Datang kembali, Ahmad Supardi/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('001/SM')).toBeInTheDocument();
      expect(screen.getByText('001/SK')).toBeInTheDocument();
    });
  });
});
