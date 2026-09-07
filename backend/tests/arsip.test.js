const request = require('supertest');

jest.mock('../src/config/supabaseClient', () => {
  return {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };
});

const supabase = require('../src/config/supabaseClient');
const app = require('../src/app');

describe('Arsip API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupAuthMock = () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null,
    });
  };

  describe('GET /api/arsip', () => {
    it('should return consolidated archive data with stats', async () => {
      setupAuthMock();

      const mockSuratMasuk = [
        {
          id: 'sm-1',
          nomor_surat: '001/SM/2026',
          tanggal_surat: '2026-01-01',
          asal_surat: 'Instansi A',
          perihal: 'Surat Masuk A',
          file_url: 'http://example.com/file1.pdf',
          created_at: '2026-01-01T10:00:00Z',
        },
      ];

      const mockSuratKeluar = [
        {
          id: 'sk-1',
          nomor_surat: '001/SK/2026',
          tanggal_surat: '2026-01-02',
          tujuan_surat: 'Instansi B',
          perihal: 'Surat Keluar B',
          file_url: null,
          status_approval: 'Disetujui',
          created_at: '2026-01-02T10:00:00Z',
        },
      ];

      supabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { full_name: 'Test User', role: 'admin', jabatan: 'Admin' },
              error: null,
            }),
          };
        }
        if (table === 'surat_masuk') {
          return {
            select: jest.fn().mockResolvedValue({ data: mockSuratMasuk, error: null }),
          };
        }
        if (table === 'surat_keluar') {
          return {
            select: jest.fn().mockResolvedValue({ data: mockSuratKeluar, error: null }),
          };
        }
        return {};
      });

      const res = await request(app)
        .get('/api/arsip?type=all')
        .set('Authorization', 'Bearer token-xyz');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.total_arsip).toBe(2);
      expect(res.body.stats.total_surat_masuk).toBe(1);
      expect(res.body.stats.total_surat_keluar).toBe(1);
      expect(res.body.stats.total_lampiran).toBe(1);
      expect(res.body.data.length).toBe(2);
    });
  });
});
