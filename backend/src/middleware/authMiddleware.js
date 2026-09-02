const supabase = require('../config/supabaseClient');

/**
 * Middleware untuk memproteksi endpoint yang membutuhkan autentikasi
 * Memeriksa token JWT yang dikirim di header Authorization: Bearer <token>
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Pastikan header Authorization ada dan berformat Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak ditemukan atau format tidak valid.'
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verifikasi token menggunakan Supabase Auth API
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau sesi telah berakhir. Silakan login kembali.'
      });
    }

    // 3. (Opsional tapi disarankan) Ambil data profile terkait (role, jabatan, dll)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, jabatan')
      .eq('id', user.id)
      .single();

    // 4. Tempelkan data user ke request object agar bisa diakses oleh controller selanjutnya
    req.user = {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      role: profile?.role || 'staff',
      jabatan: profile?.jabatan || null
    };

    next(); // Lanjutkan ke route handler
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE_EXCEPTION]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat verifikasi autentikasi.'
    });
  }
};

/**
 * Middleware khusus untuk membatasi akses berdasarkan role tertentu (Contoh: khusus Admin/Pimpinan)
 * Harus digunakan SETELAH verifyToken
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Informasi role tidak ditemukan.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses terlarang. Anda tidak memiliki izin (role) yang diperlukan untuk mengakses ini.'
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
