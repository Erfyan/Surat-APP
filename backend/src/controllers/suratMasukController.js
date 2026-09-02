const supabase = require('../config/supabaseClient');

// Nama bucket di Supabase Storage
const BUCKET_NAME = 'surat_masuk_files';

/**
 * Mendapatkan semua Surat Masuk
 * GET /api/surat-masuk
 */
const getAll = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('surat_masuk')
      .select(`
        *,
        creator:profiles!created_by(full_name, role)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data surat masuk',
      data
    });
  } catch (error) {
    console.error('[GET_ALL_SURAT_MASUK_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data surat masuk'
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
        message: 'Surat masuk tidak ditemukan'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail surat masuk',
      data
    });
  } catch (error) {
    console.error('[GET_SURAT_MASUK_BY_ID_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail surat masuk'
    });
  }
};

/**
 * Menambahkan Surat Masuk baru (beserta upload file)
 * POST /api/surat-masuk
 */
const create = async (req, res) => {
  try {
    const { nomor_surat, tanggal_surat, tanggal_diterima, asal_surat, perihal } = req.body;
    let file_url = null;

    // 1. Upload File ke Supabase Storage jika ada
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error('[UPLOAD_ERROR]:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Gagal mengunggah file'
        });
      }

      // Ambil Public URL dari file yang diunggah
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
        
      file_url = publicUrlData.publicUrl;
    }

    // 2. Insert data ke database
    const { data, error } = await supabase
      .from('surat_masuk')
      .insert([
        {
          nomor_surat,
          tanggal_surat,
          tanggal_diterima,
          asal_surat,
          perihal,
          file_url,
          created_by: req.user.id // Didapat dari authMiddleware (verifyToken)
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Surat masuk berhasil ditambahkan',
      data
    });
  } catch (error) {
    console.error('[CREATE_SURAT_MASUK_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan surat masuk'
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

    // 1. Cek apakah data exist
    const { data: existingData, error: fetchError } = await supabase
      .from('surat_masuk')
      .select('file_url')
      .eq('id', id)
      .single();

    if (fetchError || !existingData) {
      return res.status(404).json({
        success: false,
        message: 'Surat masuk tidak ditemukan'
      });
    }

    let file_url = existingData.file_url;

    // 2. Proses upload file baru jika ada
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
        
      file_url = publicUrlData.publicUrl;

      // Opsional: Hapus file lama di storage (agar tidak menumpuk)
      if (existingData.file_url) {
        // Ekstrak path dari URL
        const oldFilePathMatch = existingData.file_url.match(new RegExp(`${BUCKET_NAME}/(.+)$`));
        if (oldFilePathMatch && oldFilePathMatch[1]) {
          await supabase.storage.from(BUCKET_NAME).remove([oldFilePathMatch[1]]);
        }
      }
    }

    // 3. Update database
    const { data, error } = await supabase
      .from('surat_masuk')
      .update({
        nomor_surat,
        tanggal_surat,
        tanggal_diterima,
        asal_surat,
        perihal,
        file_url
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Surat masuk berhasil diperbarui',
      data
    });
  } catch (error) {
    console.error('[UPDATE_SURAT_MASUK_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui surat masuk'
    });
  }
};

/**
 * Menghapus Surat Masuk
 * DELETE /api/surat-masuk/:id
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Ambil data untuk tahu file_url yang harus dihapus
    const { data: existingData, error: fetchError } = await supabase
      .from('surat_masuk')
      .select('file_url')
      .eq('id', id)
      .single();

    if (fetchError || !existingData) {
      return res.status(404).json({
        success: false,
        message: 'Surat masuk tidak ditemukan'
      });
    }

    // 2. Hapus file dari Storage jika ada
    if (existingData.file_url) {
      const oldFilePathMatch = existingData.file_url.match(new RegExp(`${BUCKET_NAME}/(.+)$`));
      if (oldFilePathMatch && oldFilePathMatch[1]) {
        await supabase.storage.from(BUCKET_NAME).remove([oldFilePathMatch[1]]);
      }
    }

    // 3. Hapus record dari database
    const { error: deleteError } = await supabase
      .from('surat_masuk')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return res.status(200).json({
      success: true,
      message: 'Surat masuk berhasil dihapus'
    });
  } catch (error) {
    console.error('[DELETE_SURAT_MASUK_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus surat masuk'
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
