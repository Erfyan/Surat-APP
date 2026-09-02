require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validasi keberadaan environment variable
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY) are missing in .env');
}

/**
 * Keamanan: Menggunakan SUPABASE_SERVICE_KEY (service_role) hanya di sisi backend.
 * Kunci ini memiliki hak akses admin penuh (bypass Row Level Security / RLS) dan
 * TIDAK BOLEH dibocorkan ke client/frontend.
 */
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = supabase;
