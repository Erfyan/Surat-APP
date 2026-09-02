const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/auth/register - Registrasi user baru
router.post('/register', authController.register);

// POST /api/auth/login - Login user & dapatkan token
router.post('/login', authController.login);

// GET /api/auth/me - Dapatkan data profile user yang sedang login (Protected)
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
