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

describe('Disposisi API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupAuthMock = () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-pimpinan', email: 'boss@example.com' } },
      error: null,
    });

    supabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { full_name: 'Kepala Dinas', role: 'pimpinan', jabatan: 'Kadin' },
            error: null,
          }),
        };
      }
      return {};
    });
  };

  describe('POST /api/disposisi', () => {
    it('should return 400 if required fields are missing', async () => {
      setupAuthMock();

      const res = await request(app)
        .post('/api/disposisi')
        .set('Authorization', 'Bearer token-xyz')
        .send({ instruksi: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully create a disposisi', async () => {
      setupAuthMock();

      const newDisposisi = {
        id: 'disp-101',
        surat_masuk_id: 'sm-1',
        pengirim_id: 'user-pimpinan',
        penerima_id: 'user-staff',
        sifat: 'Penting',
        instruksi: 'Tindak lanjuti segera',
        status: 'Menunggu',
      };

      supabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { full_name: 'Kepala Dinas', role: 'pimpinan', jabatan: 'Kadin' },
              error: null,
            }),
          };
        }
        if (table === 'disposisi') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: newDisposisi, error: null }),
          };
        }
        return {};
      });

      const res = await request(app)
        .post('/api/disposisi')
        .set('Authorization', 'Bearer token-xyz')
        .send({
          surat_masuk_id: 'sm-1',
          penerima_id: 'user-staff',
          sifat: 'Penting',
          instruksi: 'Tindak lanjuti segera',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.instruksi).toBe('Tindak lanjuti segera');
    });
  });
});
