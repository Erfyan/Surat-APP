const supabase = require('../config/supabaseClient');

/**
 * Service untuk mengelola file di Supabase Storage.
 * Dipisahkan dari controller agar bisa digunakan oleh fitur lain
 * (surat keluar, disposisi, dsb.) tanpa duplikasi kode.
 */

/**
 * Mengupload file buffer ke Supabase Storage.
 * @param {object} file - Object file dari multer (req.file)
 * @param {string} bucketName - Nama bucket Supabase Storage
 * @param {string} [folder='uploads'] - Sub-folder dalam bucket
 * @returns {{ fileUrl: string|null, error: string|null }}
 */
const uploadFile = async (file, bucketName, folder = 'uploads') => {
  if (!file) return { fileUrl: null, error: null };

  try {
    const fileExt = file.originalname.split('.').pop().toLowerCase();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    const filePath = `${folder}/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error('[STORAGE_UPLOAD_ERROR]:', uploadError.message);
      return { fileUrl: null, error: uploadError.message };
    }

    // Ambil public URL file yang baru diunggah
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { fileUrl: publicUrlData.publicUrl, error: null };
  } catch (err) {
    console.error('[STORAGE_UPLOAD_EXCEPTION]:', err);
    return { fileUrl: null, error: 'Gagal mengunggah file ke storage' };
  }
};

/**
 * Menghapus file dari Supabase Storage berdasarkan public URL-nya.
 * @param {string} fileUrl - Public URL file yang akan dihapus
 * @param {string} bucketName - Nama bucket Supabase Storage
 * @returns {{ success: boolean }}
 */
const deleteFile = async (fileUrl, bucketName) => {
  if (!fileUrl) return { success: true };

  try {
    // Ekstrak path relatif dari URL: ambil bagian setelah nama bucket
    const urlParts = fileUrl.split(`/${bucketName}/`);
    if (urlParts.length < 2) {
      console.warn('[STORAGE_DELETE_WARN]: Tidak dapat mengekstrak path dari URL:', fileUrl);
      return { success: false };
    }

    const filePath = urlParts[1];
    const { error } = await supabase.storage.from(bucketName).remove([filePath]);

    if (error) {
      console.error('[STORAGE_DELETE_ERROR]:', error.message);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error('[STORAGE_DELETE_EXCEPTION]:', err);
    return { success: false };
  }
};

module.exports = { uploadFile, deleteFile };
