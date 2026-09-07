const express = require('express');
const router = express.Router();
const arsipController = require('../controllers/arsipController');
const verifyToken = require('../middleware/authMiddleware');

// Proteksi semua rute arsip dengan JWT
router.use(verifyToken);

// GET /api/arsip
router.get('/', arsipController.getArsip);

module.exports = router;
