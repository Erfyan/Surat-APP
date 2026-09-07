const request = require('supertest');

jest.mock('../src/config/supabaseClient', () => {
  return {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  };
});

const supabase = require('../src/config/supabaseClient');
const app = require('../src/app');

describe('Surat Keluar & Approval API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupAuthMock = (role = 'staff') => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null,
    });

    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { full_name: 'Test User', role: role, jabatan: 'Staf Administrasi' },
            error: null,
          }),
        };
      }
      return {};
    });
  };

  describe('POST /api/surat-keluar', () => {
    it('should return 400 if required fields are missing', async () => {
      setupAuthMock();

      const res = await request(app)
        .post('/api/surat-keluar')
        .set('Authorization', 'Bearer token-xyz')
        .send({ nomor_surat: '001/SK/2026' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('wajib diisi');
    });

    it('should create surat keluar with status Pending by default', async () => {
      setupAuthMock();

      const newSuratKeluar = {
        id: 'sk-123',
        nomor_surat: '001/SK/2026',
        tanggal_surat: '2026-01-05',
        tujuan_surat: 'Kementerian B',
        perihal: 'Laporan Triwulan',
        status_approval: 'Pending',
      };

      supabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { full_name: 'Test User', role: 'staff', jabatan: 'Staf' },
              error: null,
            }),
          };
        }
        if (table === 'surat_keluar') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: newSuratKeluar, error: null }),
          };
        }
        return {};
      });

      const res = await request(app)
        .post('/api/surat-keluar')
        .set('Authorization', 'Bearer token-xyz')
        .send({
          nomor_surat: '001/SK/2026',
          tanggal_surat: '2026-01-05',
          tujuan_surat: 'Kementerian B',
          perihal: 'Laporan Triwulan',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status_approval).toBe('Pending');
    });
  });

  describe('PUT /api/surat-keluar/:id/approval', () => {
    it('should return 400 if invalid approval status is provided', async () => {
      setupAuthMock('pimpinan');

      const res = await request(app)
        .put('/api/surat-keluar/sk-123/approval')
        .set('Authorization', 'Bearer token-xyz')
        .send({ status_approval: 'InvalidStatus' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should update approval status to Disetujui', async () => {
      setupAuthMock('pimpinan');

      const approvedSurat = {
        id: 'sk-123',
        status_approval: 'Disetujui',
        catatan_approval: 'ACC',
        approved_by: 'user-123',
      };

      supabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { full_name: 'Pimpinan User', role: 'pimpinan', jabatan: 'Kepala Dinas' },
              error: null,
            }),
          };
        }
        if (table === 'surat_keluar') {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: approvedSurat, error: null }),
          };
        }
        return {};
      });

      const res = await request(app)
        .put('/api/surat-keluar/sk-123/approval')
        .set('Authorization', 'Bearer token-xyz')
        .send({ status_approval: 'Disetujui', catatan_approval: 'ACC' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status_approval).toBe('Disetujui');
    });
  });
});
