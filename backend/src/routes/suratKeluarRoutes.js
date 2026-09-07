const express = require('express');
const router = express.Router();
const suratKeluarController = require('../controllers/suratKeluarController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Terapkan proteksi autentikasi ke semua rute di bawah ini
router.use(verifyToken);

// GET /api/surat-keluar - Ambil semua data (dukung query ?status=xxx&search=xxx)
router.get('/', suratKeluarController.getAll);

// GET /api/surat-keluar/:id - Ambil detail 1 data
router.get('/:id', suratKeluarController.getById);

// POST /api/surat-keluar - Tambah draft surat keluar baru (dengan file upload 'file')
router.post('/', upload.single('file'), suratKeluarController.create);

// PUT /api/surat-keluar/:id - Update data surat keluar (dengan file upload 'file')
router.put('/:id', upload.single('file'), suratKeluarController.update);

// PUT /api/surat-keluar/:id/approval - Approval (Setujui / Tolak) surat keluar
router.put('/:id/approval', suratKeluarController.approve);

// DELETE /api/surat-keluar/:id - Hapus data surat keluar
router.delete('/:id', suratKeluarController.remove);

module.exports = router;
