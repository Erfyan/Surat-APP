import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Layout from './Layout';

describe('Layout Component', () => {
  beforeEach(() => {
    localStorage.setItem(
      'user',
      JSON.stringify({ full_name: 'Budi Santoso', role: 'admin', jabatan: 'Kepala Bagian' })
    );
  });

  const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders title, brand, and sidebar navigation links', () => {
    renderWithRouter(<Layout title="Test Dashboard"><div>Content Inside</div></Layout>);

    expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Surat App')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Surat Masuk')).toBeInTheDocument();
    expect(screen.getByText('Disposisi')).toBeInTheDocument();
    expect(screen.getByText('Surat Keluar')).toBeInTheDocument();
    expect(screen.getByText('Arsip & Laporan')).toBeInTheDocument();
    expect(screen.getByText('Content Inside')).toBeInTheDocument();
  });

  it('displays user full name and role in sidebar', () => {
    renderWithRouter(<Layout title="Test Page"><div>Child</div></Layout>);

    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });

  it('prompts confirmation and clears storage on logout click', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithRouter(<Layout title="Test Page"><div>Child</div></Layout>);

    const logoutBtn = screen.getByTestId('logout-btn');
    fireEvent.click(logoutBtn);

    expect(confirmSpy).toHaveBeenCalledWith('Apakah Anda yakin ingin keluar dari sistem?');
    expect(localStorage.getItem('user')).toBeNull();
  });
});
