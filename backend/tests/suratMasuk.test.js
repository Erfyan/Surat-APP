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

describe('Surat Masuk API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupAuthMock = () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'staff@example.com' } },
      error: null,
    });

    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { full_name: 'Staff User', role: 'staff', jabatan: 'Operator' },
            error: null,
          }),
        };
      }
      return {};
    });
  };

  describe('GET /api/surat-masuk', () => {
    it('should return list of surat masuk', async () => {
      setupAuthMock();

      const mockSuratMasuk = [
        {
          id: 'sm-1',
          nomor_surat: '001/SM/2026',
          tanggal_surat: '2026-01-01',
          asal_surat: 'Dinas A',
          perihal: 'Undangan Rapat',
        },
      ];

      supabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { full_name: 'Staff User', role: 'staff', jabatan: 'Operator' },
              error: null,
            }),
          };
        }
        if (table === 'surat_masuk') {
          return {
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockSuratMasuk, error: null }),
          };
        }
        return {};
      });

      const res = await request(app)
        .get('/api/surat-masuk')
        .set('Authorization', 'Bearer token-xyz');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].nomor_surat).toBe('001/SM/2026');
    });
  });

  describe('POST /api/surat-masuk', () => {
    it('should create new surat masuk', async () => {
      setupAuthMock();

      const createdItem = {
        id: 'sm-new',
        nomor_surat: '002/SM/2026',
        tanggal_surat: '2026-01-02',
        asal_surat: 'Dinas B',
        perihal: 'Permohonan Data',
        created_by: 'user-123',
      };

      supabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { full_name: 'Staff User', role: 'staff', jabatan: 'Operator' },
              error: null,
            }),
          };
        }
        if (table === 'surat_masuk') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: createdItem, error: null }),
          };
        }
        return {};
      });

      const res = await request(app)
        .post('/api/surat-masuk')
        .set('Authorization', 'Bearer token-xyz')
        .send({
          nomor_surat: '002/SM/2026',
          tanggal_surat: '2026-01-02',
          asal_surat: 'Dinas B',
          perihal: 'Permohonan Data',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('sm-new');
    });
  });
});
