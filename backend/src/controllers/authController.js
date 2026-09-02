const supabase = require('../config/supabaseClient');

/**
 * Controller: Register User Baru
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // 1. Validasi input
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, dan nama lengkap (full_name) wajib diisi'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal terdiri dari 6 karakter'
      });
    }

    // 2. Buat user baru via Supabase Auth Admin API
    // Catatan Keamanan & Desain:
    // - Menggunakan supabase.auth.admin.createUser dengan email_confirm: true
    //   agar user langsung terverifikasi tanpa perlu klik link email (cocok untuk aplikasi internal instansi).
    // - full_name disimpan di user_metadata sehingga trigger database `on_auth_user_created`
    //   dapat otomatis membaca dan membuat baris di tabel `profiles`.
    // - Backend TIDAK perlu melakukan insert manual ke tabel `profiles`.
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim()
      }
    });

    if (authError) {
      console.error('[AUTH_REGISTER_ERROR]:', authError.message);
      return res.status(400).json({
        success: false,
        message: authError.message || 'Gagal mendaftarkan user baru'
      });
    }

    // 3. Response sukses (hanya kembalikan ID dan email, jangan kembalikan data sensitif)
    return res.status(201).json({
      success: true,
      message: 'Registrasi pengguna berhasil',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.user_metadata?.full_name || full_name
        }
      }
    });

  } catch (error) {
    console.error('[AUTH_REGISTER_EXCEPTION]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat registrasi'
    });
  }
};

/**
 * Controller: Login User
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi'
      });
    }

    // 2. Autentikasi dengan Supabase Auth
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    // Keamanan: Jika login gagal, kembalikan pesan umum "email atau password salah"
    // agar tidak membocorkan keberadaan email di sistem kepada penyerang
    if (sessionError || !sessionData.user || !sessionData.session) {
      if (sessionError) console.error('[AUTH_LOGIN_ERROR]:', sessionError.message);
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    const { user, session } = sessionData;

    // 3. Ambil data profil dari tabel `profiles` (full_name, role, jabatan)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role, jabatan')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[FETCH_PROFILE_ERROR]:', profileError.message);
      // Profil query gagal/fallback jika tabel profil sedang disinkronisasi
    }

    // 4. Response sukses dengan token dan data profil gabungan
    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        user: {
          id: user.id,
          email: user.email,
          full_name: profileData?.full_name || user.user_metadata?.full_name || '',
          role: profileData?.role || 'staff',
          jabatan: profileData?.jabatan || null
        }
      }
    });

  } catch (error) {
    console.error('[AUTH_LOGIN_EXCEPTION]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login'
    });
  }
};

module.exports = {
  register,
  login
};
