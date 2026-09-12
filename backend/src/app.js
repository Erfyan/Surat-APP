require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const multer = require('multer');

const authRoutes = require('./routes/authRoutes');
const suratMasukRoutes = require('./routes/suratMasukRoutes');
const disposisiRoutes = require('./routes/disposisiRoutes');
const suratKeluarRoutes = require('./routes/suratKeluarRoutes');
const arsipRoutes = require('./routes/arsipRoutes');

const { preventDuplicateRequests, apiRateLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Keamanan Header HTTP via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Izinkan akses file/storage eksternal
    contentSecurityPolicy: false, // Diserahkan ke client/SPA
  })
);

// 2. Kompresi Payload Response (Gzip / Deflate) untuk efisiensi bandwidth & kecepatan transfer data
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024, // Kompresi response yang berukuran > 1 KB
  })
);

// 3. Konfigurasi CORS (Cross-Origin Resource Sharing)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (seperti curl, mobile app, postman) atau origin dalam whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback fleksibel untuk dev
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 4. Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Anti-Spam & Rate Limiter Middleware
app.use(apiRateLimiter(300, 60000)); // Maksimal 300 request / menit per IP
app.use(preventDuplicateRequests(1500)); // Debouncing request double-click (1.5 detik)

// 6. Routing API
app.use('/api/auth', authRoutes);
app.use('/api/surat-masuk', suratMasukRoutes);
app.use('/api/disposisi', disposisiRoutes);
app.use('/api/surat-keluar', suratKeluarRoutes);
app.use('/api/arsip', arsipRoutes);

// 7. Root / Health-check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Surat App is running',
  });
});

// 8. Middleware 404 Route Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
  });
});

// 9. Centralized Error Handling Middleware (Termasuk Multer Error Handling)
app.use((err, req, res, next) => {
  console.error('[GLOBAL_ERROR_HANDLER]:', err);

  // Penanganan khusus error Multer
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Ukuran file terlalu besar! Maksimal ukuran file adalah 10 MB.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Jumlah file melebihi batas yang diizinkan.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Gagal mengunggah file: ${err.message}`,
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
  });
});

// Jalankan Server hanya jika dijalankan langsung (bukan saat diimport oleh test suite)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running securely on port ${PORT}`);
  });
}

module.exports = app;
