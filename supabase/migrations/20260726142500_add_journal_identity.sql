-- Tambahan kolom untuk mendukung tampilan "Identitas Jurnal" ARJUNA
ALTER TABLE public.journals
ADD COLUMN IF NOT EXISTS tahun_terbit TEXT DEFAULT '2016',
ADD COLUMN IF NOT EXISTS tanggal_terakhir_diajukan TEXT,
ADD COLUMN IF NOT EXISTS alamat_surat TEXT,
ADD COLUMN IF NOT EXISTS frekuensi_terbitan TEXT DEFAULT '6 Bulanan',
ADD COLUMN IF NOT EXISTS status_progres TEXT,
ADD COLUMN IF NOT EXISTS total_nilai_akreditasi NUMERIC,
ADD COLUMN IF NOT EXISTS status_akreditasi TEXT;
