import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  loginUser: vi.fn(),
}));

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

  it('renders login header, email input, password input, and submit button', () => {
    renderComponent();

    expect(screen.getByText('Login Surat App')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('pegawai@instansi.go.id')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('********')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument();
  });

  it('displays error message when login fails', async () => {
    api.loginUser.mockResolvedValueOnce({
      success: false,
      message: 'Email atau password salah',
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('pegawai@instansi.go.id'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('********'), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));

    await waitFor(() => {
      expect(screen.getByText('Email atau password salah')).toBeInTheDocument();
    });
  });

  it('stores access token and user info on successful login', async () => {
    api.loginUser.mockResolvedValueOnce({
      success: true,
      data: {
        access_token: 'fake-jwt-token',
        user: { id: 'u1', full_name: 'Budi', role: 'admin' },
      },
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('pegawai@instansi.go.id'), {
      target: { value: 'budi@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('********'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));

    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBe('fake-jwt-token');
      expect(JSON.parse(localStorage.getItem('user')).full_name).toBe('Budi');
    });
  });
});
