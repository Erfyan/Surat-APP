require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const suratMasukRoutes = require('./routes/suratMasukRoutes');
const disposisiRoutes = require('./routes/disposisiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Global
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing API
app.use('/api/auth', authRoutes);
app.use('/api/surat-masuk', suratMasukRoutes);
app.use('/api/disposisi', disposisiRoutes);


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

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
