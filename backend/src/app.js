require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const suratMasukRoutes = require('./routes/suratMasukRoutes');
const disposisiRoutes = require('./routes/disposisiRoutes');
const suratKeluarRoutes = require('./routes/suratKeluarRoutes');
const arsipRoutes = require('./routes/arsipRoutes');

const { preventDuplicateRequests, apiRateLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Anti-Spam & Rate Limiter Middleware
app.use(apiRateLimiter(200, 60000));
app.use(preventDuplicateRequests(1500));

// Routing API
app.use('/api/auth', authRoutes);
app.use('/api/surat-masuk', suratMasukRoutes);
app.use('/api/disposisi', disposisiRoutes);
app.use('/api/surat-keluar', suratKeluarRoutes);
app.use('/api/arsip', arsipRoutes);



// Root / Health-check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Surat App is running'
  });
});

// Middleware 404 Route Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[GLOBAL_ERROR_HANDLER]:', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server'
  });
});

// Jalankan Server hanya jika dijalankan langsung (bukan saat diimport oleh test suite)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
