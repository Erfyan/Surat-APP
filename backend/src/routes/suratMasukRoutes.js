const express = require('express');
const router = express.Router();
const suratMasukController = require('../controllers/suratMasukController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Terapkan proteksi autentikasi ke semua rute di bawah ini
router.use(verifyToken);

// GET /api/surat-masuk - Ambil semua data
router.get('/', suratMasukController.getAll);

// GET /api/surat-masuk/:id - Ambil detail 1 data
router.get('/:id', suratMasukController.getById);

// POST /api/surat-masuk - Tambah data baru (dengan file upload bernama 'file')
router.post('/', upload.single('file'), suratMasukController.create);

// PUT /api/surat-masuk/:id - Update data (dengan file upload bernama 'file')
router.put('/:id', upload.single('file'), suratMasukController.update);

// DELETE /api/surat-masuk/:id - Hapus data
router.delete('/:id', suratMasukController.remove);

module.exports = router;
