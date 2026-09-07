-- Skrip SQL DDL untuk Tabel Disposisi Surat
-- Eksekusi skrip ini di Supabase SQL Editor jika tabel 'disposisi' belum ada.

CREATE TABLE IF NOT EXISTS public.disposisi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    surat_masuk_id UUID NOT NULL REFERENCES public.surat_masuk(id) ON DELETE CASCADE,
    pengirim_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    penerima_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sifat VARCHAR(50) DEFAULT 'Biasa', -- 'Biasa', 'Penting', 'Segera', 'Rahasia'
    instruksi TEXT NOT NULL,
    catatan TEXT,
    batas_waktu DATE,
    status VARCHAR(50) DEFAULT 'Menunggu', -- 'Menunggu', 'Diproses', 'Selesai'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indeks untuk mengoptimalkan query berdasarkan surat_masuk_id dan penerima_id
CREATE INDEX IF NOT EXISTS idx_disposisi_surat_masuk_id ON public.disposisi(surat_masuk_id);
CREATE INDEX IF NOT EXISTS idx_disposisi_penerima_id ON public.disposisi(penerima_id);
CREATE INDEX IF NOT EXISTS idx_disposisi_pengirim_id ON public.disposisi(pengirim_id);
