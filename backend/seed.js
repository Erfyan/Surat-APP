const supabase = require('./src/config/supabaseClient');

async function seedData() {
  console.log('🚀 Memulai pengisian data dummy...');

  try {
    // 1. Ambil data profil user yang ada
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role');

    if (profileError || !profiles || profiles.length === 0) {
      console.error('❌ Tidak ditemukan profile di database. Harap register setidaknya 1 user terlebih dahulu.');
      process.exit(1);
    }

    const userId1 = profiles[0].id;
    const userId2 = profiles.length > 1 ? profiles[1].id : profiles[0].id;

    console.log(`📌 Menggunakan User ID 1: ${userId1} (${profiles[0].full_name})`);
    if (profiles.length > 1) {
      console.log(`📌 Menggunakan User ID 2: ${userId2} (${profiles[1].full_name})`);
    }

    // Hapus data dummy lama jika ada agar bersih
    console.log('🧹 Membersihkan data terdahulu...');
    await supabase.from('disposisi').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('surat_masuk').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('surat_keluar').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Data Dummy Surat Masuk
    const dummySuratMasuk = [
      {
        nomor_surat: '005/DISKOMINFO/I/2026',
        tanggal_surat: '2026-01-10',
        tanggal_diterima: '2026-01-12',
        pengirim: 'Dinas Komunikasi dan Informatika Provinsi',
        perihal: 'Undangan Rapat Evaluasi Sistem Informasi Pemerintahan Daerah Q1 2026',
        created_by: userId1,
      },
      {
        nomor_surat: '120/BKD-KOTA/II/2026',
        tanggal_surat: '2026-02-02',
        tanggal_diterima: '2026-02-04',
        pengirim: 'Badan Kepegawaian dan Pengembangan SDM Kota',
        perihal: 'Pemberitahuan Pelaksanaan Pelatihan Tata Naskah Dinas Elektronik (TNDE)',
        created_by: userId1,
      },
      {
        nomor_surat: '800/BPKAD/II/2026',
        tanggal_surat: '2026-02-15',
        tanggal_diterima: '2026-02-16',
        pengirim: 'Badan Pengelola Keuangan dan Aset Daerah (BPKAD)',
        perihal: 'Permohonan Data Inventarisasi Aset TI dan Perangkat Lunak 2026',
        created_by: userId2,
      },
      {
        nomor_surat: '045.2/UNIV-IND/III/2026',
        tanggal_surat: '2026-03-01',
        tanggal_diterima: '2026-03-03',
        pengirim: 'Fakultas Ilmu Komputer Universitas Indonesia',
        perihal: 'Permohonan Izin Riset & Magang Mahasiswa Semester Genap 2026',
        created_by: userId1,
      },
      {
        nomor_surat: '018/KEMENSETNEG/III/2026',
        tanggal_surat: '2026-03-05',
        tanggal_diterima: '2026-03-06',
        pengirim: 'Kementerian Sekretariat Negara RI',
        perihal: 'Edaran Pedoman Keamanan Informasi dan Audit Kepatuhan SPBE 2026',
        created_by: userId2,
      },
      {
        nomor_surat: '220/INS-TEK/III/2026',
        tanggal_surat: '2026-03-10',
        tanggal_diterima: '2026-03-11',
        pengirim: 'PT Telekomunikasi Solusi Nusantara',
        perihal: 'Penawaran Kerjasama Pemeliharaan Infrastruktur Jaringan & Server',
        created_by: userId1,
      },
      {
        nomor_surat: '090/INSP-PROV/III/2026',
        tanggal_surat: '2026-03-12',
        tanggal_diterima: '2026-03-12',
        pengirim: 'Inspektorat Daerah Provinsi',
        perihal: 'Jadwal Pendampingan Audit Kepatuhan Pengelolaan Arsip Persuratan',
        created_by: userId2,
      },
    ];

    console.log('📦 Menambahkan data Surat Masuk...');
    const { data: insertedSM, error: smError } = await supabase
      .from('surat_masuk')
      .insert(dummySuratMasuk)
      .select();

    if (smError) {
      console.error('❌ Gagal insert Surat Masuk:', smError.message);
    } else {
      console.log(`✅ Berhasil menambahkan ${insertedSM.length} data Surat Masuk`);
    }

    // 3. Data Dummy Surat Keluar
    const dummySuratKeluar = [
      {
        nomor_surat: '001/SK/ORG/2026',
        tanggal_surat: '2026-01-15',
        tujuan: 'Kepala Dinas Komunikasi dan Informatika Provinsi',
        perihal: 'Konfirmasi Kehadiran Rapat Evaluasi Sistem Informasi',
        created_by: userId1,
        status: 'disetujui',
        approved_by: userId1,
        approved_at: new Date('2026-01-16T09:00:00Z').toISOString(),
      },
      {
        nomor_surat: '002/SK/ORG/2026',
        tanggal_surat: '2026-02-05',
        tujuan: 'Badan Kepegawaian dan Pengembangan SDM Kota',
        perihal: 'Daftar Peserta Bimtek Tata Naskah Dinas Elektronik',
        created_by: userId2,
        status: 'disetujui',
        approved_by: userId1,
        approved_at: new Date('2026-02-06T10:30:00Z').toISOString(),
      },
      {
        nomor_surat: '003/SK/ORG/2026',
        tanggal_surat: '2026-02-20',
        tujuan: 'Badan Pengelola Keuangan dan Aset Daerah (BPKAD)',
        perihal: 'Laporan Rekapitulasi Aset Komputer dan Perangkat TI',
        created_by: userId1,
        status: 'draft',
      },
      {
        nomor_surat: '004/SK/ORG/2026',
        tanggal_surat: '2026-03-04',
        tujuan: 'Dekan Fakultas Ilmu Komputer Universitas Indonesia',
        perihal: 'Persetujuan Izin Magang & Penerimaan Riset Mahasiswa',
        created_by: userId1,
        status: 'disetujui',
        approved_by: userId1,
        approved_at: new Date('2026-03-04T14:15:00Z').toISOString(),
      },
      {
        nomor_surat: '005/SK/ORG/2026',
        tanggal_surat: '2026-03-08',
        tujuan: 'Kementerian Sekretariat Negara RI',
        perihal: 'Laporan Mandiri Audit Kepatuhan Keamanan SPBE 2026',
        created_by: userId2,
        status: 'draft',
      },
      {
        nomor_surat: '006/SK/ORG/2026',
        tanggal_surat: '2026-03-11',
        tujuan: 'PT Telekomunikasi Solusi Nusantara',
        perihal: 'Penolakan Penawaran Pemeliharaan Server',
        created_by: userId2,
        status: 'ditolak',
        catatan_approval: 'Format penolakan perlu disesuaikan dengan instruksi Pimpinan.',
      },
    ];

    console.log('📦 Menambahkan data Surat Keluar...');
    const { data: insertedSK, error: skError } = await supabase
      .from('surat_keluar')
      .insert(dummySuratKeluar)
      .select();

    if (skError) {
      console.error('❌ Gagal insert Surat Keluar:', skError.message);
    } else {
      console.log(`✅ Berhasil menambahkan ${insertedSK.length} data Surat Keluar`);
    }

    // 4. Data Dummy Disposisi
    if (insertedSM && insertedSM.length > 0) {
      const dummyDisposisi = [
        {
          surat_masuk_id: insertedSM[0].id,
          dari_user_id: userId1,
          ke_user_id: userId2,
          instruksi: 'Tindak Lanjuti & Siapkan Bahan Rapat',
          catatan: 'Koordinasikan dengan unit teknis sebelum hari Kamis.',
          status: 'selesai',
        },
        {
          surat_masuk_id: insertedSM[1].id,
          dari_user_id: userId1,
          ke_user_id: userId2,
          instruksi: 'Koordinasikan Dengan Unit Terkait',
          catatan: 'Daftarkan 3 staf operasional penanggung jawab naskah dinas.',
          status: 'selesai',
        },
        {
          surat_masuk_id: insertedSM[2].id,
          dari_user_id: userId1,
          ke_user_id: userId2,
          instruksi: 'Kaji & Berikan Tanggapan/Saran',
          catatan: 'Susun rincian aset TI bersama tim infrastruktur.',
          status: 'diproses',
        },
        {
          surat_masuk_id: insertedSM[4].id,
          dari_user_id: userId1,
          ke_user_id: userId2,
          instruksi: 'Tindak Lanjuti & Siapkan Bahan Rapat',
          catatan: 'Lakukan pemetaan kesesuaian standar ISO 27001.',
          status: 'belum_dibaca',
        },
        {
          surat_masuk_id: insertedSM[6].id,
          dari_user_id: userId1,
          ke_user_id: userId2,
          instruksi: 'Wakili Pimpinan Dalam Pertemuan',
          catatan: 'Siapkan seluruh dokumen fisik & digital arsip persuratan.',
          status: 'diproses',
        },
      ];

      console.log('📦 Menambahkan data Disposisi...');
      const { data: insertedDisp, error: dispError } = await supabase
        .from('disposisi')
        .insert(dummyDisposisi)
        .select();

      if (dispError) {
        console.error('❌ Gagal insert Disposisi:', dispError.message);
      } else {
        console.log(`✅ Berhasil menambahkan ${insertedDisp.length} data Disposisi`);
      }
    }

    console.log('🎉 Pengisian data dummy selesai dengan sukses!');
    process.exit(0);
  } catch (err) {
    console.error('💥 Fatal error saat seed data:', err);
    process.exit(1);
  }
}

seedData();
