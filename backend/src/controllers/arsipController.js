const supabase = require('../config/supabaseClient');

/**
 * Mendapatkan Daftar Arsip Digital (Gabungan Surat Masuk & Surat Keluar)
 * GET /api/arsip
 * Query parameters:
 *  - type: 'all' | 'surat_masuk' | 'surat_keluar'
 *  - search: keyword pencarian (nomor, pihak, perihal)
 *  - startDate: YYYY-MM-DD
 *  - endDate: YYYY-MM-DD
 *  - status: 'all' | 'Pending' | 'Disetujui' | 'Ditolak'
 */
const getArsip = async (req, res) => {
  try {
    const { type = 'all', search, startDate, endDate, status = 'all' } = req.query;

    let items = [];

    // 1. Ambil Surat Masuk jika type == 'all' atau type == 'surat_masuk'
    if (type === 'all' || type === 'surat_masuk') {
      let querySM = supabase
        .from('surat_masuk')
        .select(`
          *,
          creator:profiles!created_by(full_name, role)
        `);

      if (startDate) {
        querySM = querySM.gte('tanggal_surat', startDate);
      }
      if (endDate) {
        querySM = querySM.lte('tanggal_surat', endDate);
      }

      const { data: dataSM, error: errSM } = await querySM;
      if (errSM) throw errSM;

      if (dataSM) {
        const formattedSM = dataSM.map((item) => ({
          id: item.id,
          jenis: 'Surat Masuk',
          jenis_code: 'surat_masuk',
          nomor_surat: item.nomor_surat || '-',
          tanggal_surat: item.tanggal_surat,
          pihak: item.asal_surat || '-',
          perihal: item.perihal || '-',
          file_url: item.file_url,
          status_approval: 'Disetujui', // Surat masuk yang sudah diinput dianggap aktif/resmi
          created_at: item.created_at,
          creator: item.creator,
          detail_url: `/surat-masuk/${item.id}`,
        }));

        items.push(...formattedSM);
      }
    }

    // 2. Ambil Surat Keluar jika type == 'all' atau type == 'surat_keluar'
    if (type === 'all' || type === 'surat_keluar') {
      let querySK = supabase
        .from('surat_keluar')
        .select(`
          *,
          creator:profiles!created_by(id, full_name, role, jabatan),
          approver:profiles!approved_by(id, full_name, role, jabatan)
        `);

      if (startDate) {
        querySK = querySK.gte('tanggal_surat', startDate);
      }
      if (endDate) {
        querySK = querySK.lte('tanggal_surat', endDate);
      }
      if (status !== 'all') {
        querySK = querySK.eq('status_approval', status);
      }

      const { data: dataSK, error: errSK } = await querySK;
      if (errSK) throw errSK;

      if (dataSK) {
        const formattedSK = dataSK.map((item) => ({
          id: item.id,
          jenis: 'Surat Keluar',
          jenis_code: 'surat_keluar',
          nomor_surat: item.nomor_surat || '-',
          tanggal_surat: item.tanggal_surat,
          pihak: item.tujuan_surat || '-',
          perihal: item.perihal || '-',
          file_url: item.file_url,
          status_approval: item.status_approval || 'Pending',
          created_at: item.created_at,
          creator: item.creator,
          approver: item.approver,
          detail_url: `/surat-keluar/${item.id}`,
        }));

        items.push(...formattedSK);
      }
    }

    // 3. Filter berdasarkan keyword pencarian (search)
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.nomor_surat?.toLowerCase().includes(q) ||
          item.pihak?.toLowerCase().includes(q) ||
          item.perihal?.toLowerCase().includes(q) ||
          item.jenis?.toLowerCase().includes(q)
      );
    }

    // 4. Urutkan berdasarkan tanggal_surat terbaru
    items.sort((a, b) => new Date(b.tanggal_surat) - new Date(a.tanggal_surat));

    // 5. Statistik ringkasan arsip
    const stats = {
      total_arsip: items.length,
      total_surat_masuk: items.filter((i) => i.jenis_code === 'surat_masuk').length,
      total_surat_keluar: items.filter((i) => i.jenis_code === 'surat_keluar').length,
      total_lampiran: items.filter((i) => Boolean(i.file_url)).length,
    };

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar arsip digital',
      stats,
      data: items,
    });
  } catch (error) {
    console.error('[GET_ARSIP_ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil daftar arsip: ' + (error.message || 'Error server'),
    });
  }
};

module.exports = {
  getArsip,
};
