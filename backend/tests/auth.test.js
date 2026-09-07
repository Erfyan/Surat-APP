const request = require('supertest');

// Mock supabaseClient sebelum mengimport app
jest.mock('../src/config/supabaseClient', () => {
  return {
    auth: {
      admin: {
        createUser: jest.fn(),
      },
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(),
  };
});

const supabase = require('../src/config/supabaseClient');
const app = require('../src/app');

describe('Auth API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return health check status', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'API Surat App is running',
      });
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('wajib diisi');
    });

    it('should return 400 if password length is less than 6', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: '123', full_name: 'Test User' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('minimal terdiri dari 6');
    });

    it('should successfully register a new user', async () => {
      supabase.auth.admin.createUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' },
          },
        },
        error: null,
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe('user-123');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if email or password missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 if login fails', async () => {
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email atau password salah');
    });

    it('should return access token on successful login', async () => {
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
          session: { access_token: 'fake-jwt-token', refresh_token: 'fake-refresh-token' },
        },
        error: null,
      });

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({
          data: { full_name: 'Test User', role: 'admin', jabatan: 'Sekretaris' },
          error: null,
        }),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.access_token).toBe('fake-jwt-token');
      expect(res.body.data.user.role).toBe('admin');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 if token is missing', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should return current user profile if valid token provided', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValueOnce({
          data: { full_name: 'Test User', role: 'admin', jabatan: 'Kadin' },
          error: null,
        }),
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-jwt-token');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe('user-123');
    });
  });
});
