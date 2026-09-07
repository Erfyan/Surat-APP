-- Skrip SQL DDL untuk Tabel Surat Keluar
-- Eksekusi skrip ini di Supabase SQL Editor jika tabel 'surat_keluar' belum ada.

CREATE TABLE IF NOT EXISTS public.surat_keluar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nomor_surat VARCHAR(100),
    tanggal_surat DATE NOT NULL,
    tujuan_surat VARCHAR(255) NOT NULL,
    perihal TEXT NOT NULL,
    isi_ringkas TEXT,
    file_url TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status_approval VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Disetujui', 'Ditolak'
    catatan_approval TEXT,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indeks untuk mengoptimalkan performa pencarian & filter status approval
CREATE INDEX IF NOT EXISTS idx_surat_keluar_status ON public.surat_keluar(status_approval);
CREATE INDEX IF NOT EXISTS idx_surat_keluar_created_by ON public.surat_keluar(created_by);
CREATE INDEX IF NOT EXISTS idx_surat_keluar_approved_by ON public.surat_keluar(approved_by);
