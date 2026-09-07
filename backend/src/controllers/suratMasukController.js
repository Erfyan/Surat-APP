const supabase = require('../config/supabaseClient');
const { uploadFile, deleteFile } = require('../services/storageService');

const BUCKET_NAME = 'surat_masuk_files';

/**
 * Mendapatkan semua Surat Masuk
 * GET /api/surat-masuk
 */
const getAll = async (req, res) => {
  try {
    const { search, startDate, endDate } = req.query;

    let query = supabase
      .from('surat_masuk')
      .select(`
        *,
        creator:profiles!created_by(full_name, role)
      `)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('tanggal_surat', startDate);
    }
    if (endDate) {
      query = query.lte('tanggal_surat', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    let result = data || [];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.nomor_surat?.toLowerCase().includes(q) ||
          s.asal_surat?.toLowerCase().includes(q) ||
          s.perihal?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data surat masuk',
      data: result,
    });
  } catch (error) {
    console.error('[GET_ALL_SURAT_MASUK_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data surat masuk',
    });
  }
};

/**
 * Mendapatkan Surat Masuk berdasarkan ID
 * GET /api/surat-masuk/:id
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('surat_masuk')
      .select(`
        *,
        creator:profiles!created_by(full_name, role)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Surat masuk tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail surat masuk',
      data,
    });
  } catch (error) {
    console.error('[GET_SURAT_MASUK_BY_ID_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail surat masuk',
    });
  }
};

/**
 * Menambahkan Surat Masuk baru (beserta upload file ke Supabase Storage)
 * POST /api/surat-masuk
 */
const create = async (req, res) => {
  try {
    const { nomor_surat, tanggal_surat, tanggal_diterima, asal_surat, perihal } = req.body;

    // 1. Upload lampiran ke Supabase Storage (jika ada)
    const { fileUrl, error: uploadError } = await uploadFile(req.file, BUCKET_NAME);
    if (uploadError) {
      return res.status(400).json({ success: false, message: 'Gagal mengunggah lampiran: ' + uploadError });
    }

    // 2. Insert data ke tabel surat_masuk
    const { data, error } = await supabase
      .from('surat_masuk')
      .insert([
        {
          nomor_surat,
          tanggal_surat,
          tanggal_diterima: tanggal_diterima || null,
          asal_surat,
          perihal,
          file_url: fileUrl,
          created_by: req.user.id, // disediakan oleh authMiddleware (verifyToken)
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Surat masuk berhasil ditambahkan',
      data,
    });
  } catch (error) {
    console.error('[CREATE_SURAT_MASUK_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan surat masuk',
    });
  }
};

/**
 * Memperbarui data Surat Masuk
 * PUT /api/surat-masuk/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomor_surat, tanggal_surat, tanggal_diterima, asal_surat, perihal } = req.body;

    // 1. Cek apakah data exist dan ambil file_url lama
    const { data: existingData, error: fetchError } = await supabase
      .from('surat_masuk')
      .select('file_url')
      .eq('id', id)
      .single();

    if (fetchError || !existingData) {
      return res.status(404).json({
        success: false,
        message: 'Surat masuk tidak ditemukan',
      });
    }

    let file_url = existingData.file_url;

    // 2. Jika ada file baru: upload ke storage, lalu hapus file lama
    if (req.file) {
      const { fileUrl: newFileUrl, error: uploadError } = await uploadFile(req.file, BUCKET_NAME);
      if (uploadError) {
        return res.status(400).json({ success: false, message: 'Gagal mengunggah lampiran baru: ' + uploadError });
      }

      // Hapus file lama dari Storage agar tidak menumpuk
      await deleteFile(existingData.file_url, BUCKET_NAME);

      file_url = newFileUrl;
    }

    // 3. Update data di database
    const { data, error } = await supabase
      .from('surat_masuk')
      .update({ nomor_surat, tanggal_surat, tanggal_diterima: tanggal_diterima || null, asal_surat, perihal, file_url })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Surat masuk berhasil diperbarui',
      data,
    });
  } catch (error) {
    console.error('[UPDATE_SURAT_MASUK_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui surat masuk',
    });
  }
};

/**
 * Menghapus Surat Masuk (dan file lampirannya di Supabase Storage)
 * DELETE /api/surat-masuk/:id
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Ambil file_url agar bisa dihapus dari storage
    const { data: existingData, error: fetchError } = await supabase
      .from('surat_masuk')
      .select('file_url')
      .eq('id', id)
      .single();

    if (fetchError || !existingData) {
      return res.status(404).json({
        success: false,
        message: 'Surat masuk tidak ditemukan',
      });
    }

    // 2. Hapus file dari Storage
    await deleteFile(existingData.file_url, BUCKET_NAME);

    // 3. Hapus record dari database
    const { error: deleteError } = await supabase
      .from('surat_masuk')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return res.status(200).json({
      success: true,
      message: 'Surat masuk berhasil dihapus',
    });
  } catch (error) {
    console.error('[DELETE_SURAT_MASUK_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus surat masuk',
    });
  }
};

module.exports = { getAll, getById, create, update, remove };
