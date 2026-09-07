const express = require('express');
const router = express.Router();
const disposisiController = require('../controllers/disposisiController');
const { verifyToken } = require('../middleware/authMiddleware');

// Proteksi seluruh rute disposisi dengan middleware autentikasi JWT
router.use(verifyToken);

// GET /api/disposisi - Ambil semua data disposisi (dukung ?surat_masuk_id=xxx)
router.get('/', disposisiController.getAll);

// GET /api/disposisi/surat/:suratMasukId - Ambil disposisi per Surat Masuk
router.get('/surat/:suratMasukId', disposisiController.getBySuratId);

// GET /api/disposisi/:id - Detail 1 disposisi
router.get('/:id', disposisiController.getById);

// POST /api/disposisi - Buat disposisi baru
router.post('/', disposisiController.create);

// PUT /api/disposisi/:id - Update data/status disposisi
router.put('/:id', disposisiController.update);

// DELETE /api/disposisi/:id - Hapus disposisi
router.delete('/:id', disposisiController.remove);

module.exports = router;
