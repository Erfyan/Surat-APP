const supabase = require('../config/supabaseClient');

/**
 * Helper function untuk memformat item disposisi
 */
const formatDisposisiItem = (item) => {
  if (!item) return item;
  return {
    ...item,
    pengirim_id: item.pengirim_id || item.dari_user_id,
    penerima_id: item.penerima_id || item.ke_user_id,
    sifat: item.sifat || 'Biasa',
    batas_waktu: item.batas_waktu || null,
    surat_masuk: item.surat_masuk
      ? {
          ...item.surat_masuk,
          asal_surat: item.surat_masuk.asal_surat || item.surat_masuk.pengirim || '-',
        }
      : null,
  };
};

/**
 * Controller: Mendapatkan daftar disposisi
 * GET /api/disposisi
 * Query params opsional: ?surat_masuk_id=xxx
 */
const getAll = async (req, res) => {
  try {
    const { surat_masuk_id } = req.query;

    let query = supabase
      .from('disposisi')
      .select(`
        *,
        surat_masuk:surat_masuk_id(id, nomor_surat, perihal, pengirim, tanggal_surat),
        pengirim:profiles!dari_user_id(id, full_name, role, jabatan),
        penerima:profiles!ke_user_id(id, full_name, role, jabatan)
      `)
      .order('created_at', { ascending: false });

    if (surat_masuk_id) {
      query = query.eq('surat_masuk_id', surat_masuk_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    const formattedData = (data || []).map(formatDisposisiItem);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data disposisi',
      data: formattedData,
    });
  } catch (error) {
    console.error('[GET_ALL_DISPOSISI_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data disposisi',
    });
  }
};

/**
 * Controller: Mendapatkan disposisi berdasarkan ID Surat Masuk
 * GET /api/disposisi/surat/:suratMasukId
 */
const getBySuratId = async (req, res) => {
  try {
    const { suratMasukId } = req.params;

    const { data, error } = await supabase
      .from('disposisi')
      .select(`
        *,
        surat_masuk:surat_masuk_id(id, nomor_surat, perihal, pengirim, tanggal_surat),
        pengirim:profiles!dari_user_id(id, full_name, role, jabatan),
        penerima:profiles!ke_user_id(id, full_name, role, jabatan)
      `)
      .eq('surat_masuk_id', suratMasukId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedData = (data || []).map(formatDisposisiItem);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil disposisi surat masuk',
      data: formattedData,
    });
  } catch (error) {
    console.error('[GET_DISPOSISI_BY_SURAT_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil disposisi surat masuk',
    });
  }
};

/**
 * Controller: Mendapatkan detail disposisi berdasarkan ID Disposisi
 * GET /api/disposisi/:id
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('disposisi')
      .select(`
        *,
        surat_masuk:surat_masuk_id(id, nomor_surat, perihal, pengirim, tanggal_surat),
        pengirim:profiles!dari_user_id(id, full_name, role, jabatan),
        penerima:profiles!ke_user_id(id, full_name, role, jabatan)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Data disposisi tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail disposisi',
      data: formatDisposisiItem(data),
    });
  } catch (error) {
    console.error('[GET_DISPOSISI_BY_ID_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail disposisi',
    });
  }
};

/**
 * Controller: Membuat Disposisi Baru
 * POST /api/disposisi
 */
const create = async (req, res) => {
  try {
    const { surat_masuk_id, penerima_id, sifat, instruksi, catatan, batas_waktu, status } = req.body;

    if (!surat_masuk_id || !penerima_id || !instruksi) {
      return res.status(400).json({
        success: false,
        message: 'Surat masuk, penerima disposisi, dan instruksi wajib diisi',
      });
    }

    const insertPayload = {
      surat_masuk_id,
      dari_user_id: req.user.id,
      ke_user_id: penerima_id,
      instruksi,
      catatan: catatan || null,
      status: status || 'Menunggu',
    };

    const { data, error } = await supabase
      .from('disposisi')
      .insert([insertPayload])
      .select(`
        *,
        surat_masuk:surat_masuk_id(id, nomor_surat, perihal),
        pengirim:profiles!dari_user_id(id, full_name, role, jabatan),
        penerima:profiles!ke_user_id(id, full_name, role, jabatan)
      `)
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Disposisi berhasil dibuat',
      data: formatDisposisiItem(data),
    });
  } catch (error) {
    console.error('[CREATE_DISPOSISI_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat disposisi: ' + (error.message || 'Error server'),
    });
  }
};

/**
 * Controller: Memperbarui Data Disposisi / Status Disposisi
 * PUT /api/disposisi/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { penerima_id, sifat, instruksi, catatan, batas_waktu, status } = req.body;

    const updatePayload = {};
    if (penerima_id !== undefined) updatePayload.ke_user_id = penerima_id;
    if (instruksi !== undefined) updatePayload.instruksi = instruksi;
    if (catatan !== undefined) updatePayload.catatan = catatan;
    if (status !== undefined) updatePayload.status = status;

    const { data, error } = await supabase
      .from('disposisi')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        surat_masuk:surat_masuk_id(id, nomor_surat, perihal),
        pengirim:profiles!dari_user_id(id, full_name, role, jabatan),
        penerima:profiles!ke_user_id(id, full_name, role, jabatan)
      `)
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Disposisi berhasil diperbarui',
      data: formatDisposisiItem(data),
    });
  } catch (error) {
    console.error('[UPDATE_DISPOSISI_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui disposisi',
    });
  }
};

/**
 * Controller: Menghapus Disposisi
 * DELETE /api/disposisi/:id
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('disposisi')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Disposisi berhasil dihapus',
    });
  } catch (error) {
    console.error('[DELETE_DISPOSISI_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus disposisi',
    });
  }
};

module.exports = {
  getAll,
  getBySuratId,
  getById,
  create,
  update,
  remove,
};
