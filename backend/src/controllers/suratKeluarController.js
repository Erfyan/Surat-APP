const supabase = require('../config/supabaseClient');
const { uploadFile, deleteFile } = require('../services/storageService');

const BUCKET_NAME = 'surat_keluar_files';

/**
 * Mendapatkan semua Surat Keluar
 * GET /api/surat-keluar
 * Supports query params: ?status=Pending|Disetujui|Ditolak
 */
const getAll = async (req, res) => {
  try {
    const { status, search, startDate, endDate } = req.query;

    let query = supabase
      .from('surat_keluar')
      .select(`
        *,
        creator:profiles!created_by(id, full_name, role, jabatan),
        approver:profiles!approved_by(id, full_name, role, jabatan)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status_approval', status);
    }
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
          s.tujuan_surat?.toLowerCase().includes(q) ||
          s.perihal?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data surat keluar',
      data: result,
    });
  } catch (error) {
    console.error('[GET_ALL_SURAT_KELUAR_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data surat keluar',
    });
  }
};

/**
 * Mendapatkan Detail Surat Keluar berdasarkan ID
 * GET /api/surat-keluar/:id
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('surat_keluar')
      .select(`
        *,
        creator:profiles!created_by(id, full_name, role, jabatan),
        approver:profiles!approved_by(id, full_name, role, jabatan)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Surat keluar tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail surat keluar',
      data,
    });
  } catch (error) {
    console.error('[GET_SURAT_KELUAR_BY_ID_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail surat keluar',
    });
  }
};

/**
 * Menambahkan Surat Keluar Baru (beserta Upload File ke Storage)
 * POST /api/surat-keluar
 */
const create = async (req, res) => {
  try {
    const { nomor_surat, tanggal_surat, tujuan_surat, perihal, isi_ringkas, status_approval } =
      req.body;

    if (!tanggal_surat || !tujuan_surat || !perihal) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal surat, tujuan surat, dan perihal wajib diisi',
      });
    }

    // 1. Upload lampiran ke Supabase Storage (jika ada file)
    const { fileUrl, error: uploadError } = await uploadFile(req.file, BUCKET_NAME);
    if (uploadError) {
      return res
        .status(400)
        .json({ success: false, message: 'Gagal mengunggah file lampiran: ' + uploadError });
    }

    // 2. Insert data ke tabel surat_keluar
    const { data, error } = await supabase
      .from('surat_keluar')
      .insert([
        {
          nomor_surat: nomor_surat || null,
          tanggal_surat,
          tujuan_surat,
          perihal,
          isi_ringkas: isi_ringkas || null,
          file_url: fileUrl,
          created_by: req.user.id,
          status_approval: status_approval || 'Pending',
        },
      ])
      .select(`
        *,
        creator:profiles!created_by(id, full_name, role, jabatan)
      `)
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Surat keluar berhasil dibuat',
      data,
    });
  } catch (error) {
    console.error('[CREATE_SURAT_KELUAR_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat surat keluar: ' + (error.message || 'Error server'),
    });
  }
};

/**
 * Memperbarui Data Surat Keluar
 * PUT /api/surat-keluar/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomor_surat, tanggal_surat, tujuan_surat, perihal, isi_ringkas } = req.body;

    // 1. Cek keberadaan surat keluar & ambil file_url lama
    const { data: existingData, error: fetchError } = await supabase
      .from('surat_keluar')
      .select('file_url, status_approval')
      .eq('id', id)
      .single();

    if (fetchError || !existingData) {
      return res.status(404).json({
        success: false,
        message: 'Surat keluar tidak ditemukan',
      });
    }

    let file_url = existingData.file_url;

    // 2. Jika ada file baru diunggah, simpan dan hapus file lama
    if (req.file) {
      const { fileUrl: newFileUrl, error: uploadError } = await uploadFile(req.file, BUCKET_NAME);
      if (uploadError) {
        return res
          .status(400)
          .json({ success: false, message: 'Gagal mengunggah file baru: ' + uploadError });
      }

      await deleteFile(existingData.file_url, BUCKET_NAME);
      file_url = newFileUrl;
    }

    // 3. Update database
    const { data, error } = await supabase
      .from('surat_keluar')
      .update({
        nomor_surat: nomor_surat || null,
        tanggal_surat,
        tujuan_surat,
        perihal,
        isi_ringkas: isi_ringkas || null,
        file_url,
      })
      .eq('id', id)
      .select(`
        *,
        creator:profiles!created_by(id, full_name, role, jabatan),
        approver:profiles!approved_by(id, full_name, role, jabatan)
      `)
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Surat keluar berhasil diperbarui',
      data,
    });
  } catch (error) {
    console.error('[UPDATE_SURAT_KELUAR_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui surat keluar',
    });
  }
};

/**
 * Process Approval / Penolakan Surat Keluar
 * PUT /api/surat-keluar/:id/approval
 */
const approve = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_approval, catatan_approval } = req.body;

    if (!['Disetujui', 'Ditolak', 'Pending'].includes(status_approval)) {
      return res.status(400).json({
        success: false,
        message: "Status approval harus bernilai 'Disetujui', 'Ditolak', atau 'Pending'",
      });
    }

    const { data, error } = await supabase
      .from('surat_keluar')
      .update({
        status_approval,
        catatan_approval: catatan_approval || null,
        approved_by: req.user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        creator:profiles!created_by(id, full_name, role, jabatan),
        approver:profiles!approved_by(id, full_name, role, jabatan)
      `)
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: `Surat keluar berhasil di-${status_approval.toLowerCase()}`,
      data,
    });
  } catch (error) {
    console.error('[APPROVE_SURAT_KELUAR_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memproses approval surat keluar',
    });
  }
};

/**
 * Menghapus Surat Keluar beserta File Lampiran
 * DELETE /api/surat-keluar/:id
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existingData, error: fetchError } = await supabase
      .from('surat_keluar')
      .select('file_url')
      .eq('id', id)
      .single();

    if (fetchError || !existingData) {
      return res.status(404).json({
        success: false,
        message: 'Surat keluar tidak ditemukan',
      });
    }

    // Hapus file dari Storage
    await deleteFile(existingData.file_url, BUCKET_NAME);

    // Hapus record dari database
    const { error: deleteError } = await supabase.from('surat_keluar').delete().eq('id', id);

    if (deleteError) throw deleteError;

    return res.status(200).json({
      success: true,
      message: 'Surat keluar berhasil dihapus',
    });
  } catch (error) {
    console.error('[DELETE_SURAT_KELUAR_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus surat keluar',
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  approve,
  remove,
};
