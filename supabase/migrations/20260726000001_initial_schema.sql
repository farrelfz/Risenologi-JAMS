-- =============================================================================
-- RISENOLOGI JAMS — Initial Schema
-- Source of truth: PENDALAMAN_RISENOLOGI_JAMS.md BAB 5.2 (Model Data Inti)
-- Accreditation rubric: MASTER_SYSTEM_PROMPT BAB 5.9 (Rubrik Skor Lengkap)
-- =============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- 1. USERS & ROLES
-- Managed by Supabase Auth; we store RBAC metadata in user_profiles
-- Valid roles: administrator, journal_manager, editor
-- FORBIDDEN roles: author, reviewer (BAB 8 — no external portals)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('administrator', 'journal_manager', 'editor')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 2. JURNAL (Level 0)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.journals (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama                        TEXT NOT NULL,
  p_issn                      TEXT,
  e_issn                      TEXT,
  url_situs                   TEXT,
  focus_and_scope             TEXT,
  status_sinta                TEXT CHECK (status_sinta IN ('sinta_1','sinta_2','sinta_3','sinta_4','sinta_5','sinta_6','tidak_terakreditasi')),
  tanggal_akreditasi_terakhir DATE,
  tanggal_akreditasi_berakhir DATE,
  frekuensi_terbit_per_tahun  INTEGER,
  nomor_rubrik_instrumen      TEXT DEFAULT 'Instrumen Periode II 2025',
  -- Manual input fields (cannot be auto-detected)
  skor_penamaan_jurnal        NUMERIC(4,1), -- Indikator 1, max 2
  skor_kelembagaan_penerbit   NUMERIC(4,1), -- Indikator 2, max 5
  skor_manajemen_jurnal       NUMERIC(4,1), -- Indikator 3F, max 2
  skor_lembaga_pengindeks     NUMERIC(4,1), -- Indikator 8B, max 8
  catatan                     TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. EDISI (Level 1)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.editions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id               UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  volume                   INTEGER NOT NULL,
  nomor                    INTEGER NOT NULL,
  tahun                    INTEGER NOT NULL,
  tanggal_terbit_rencana   DATE,
  tanggal_terbit_aktual    DATE,
  status                   TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','persiapan','siap_terbit','terbit')),
  total_halaman            INTEGER,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (journal_id, volume, nomor)
);

-- =============================================================================
-- 4. ARTIKEL (Level 2)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.articles (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id                 UUID NOT NULL REFERENCES public.editions(id) ON DELETE CASCADE,
  judul                      TEXT NOT NULL,
  judul_sirahan              TEXT, -- running title
  abstrak                    TEXT,
  kata_kunci                 TEXT[],
  doi                        TEXT,
  halaman_awal               INTEGER,
  halaman_akhir              INTEGER,
  -- Workflow status
  status                     TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','review','revisi','diterima','ditolak','terbit')),
  tanggal_submit             DATE,
  tanggal_revisi             DATE,
  tanggal_diterima           DATE,
  -- Klinik artikel (Protokol B — PENDALAMAN BAB 1.2)
  klinik_dilaksanakan        BOOLEAN DEFAULT FALSE,
  tanggal_klinik             DATE,
  klinik_disetujui_penulis   BOOLEAN DEFAULT FALSE,
  -- Metadata completeness
  lisensi                    TEXT, -- mis. CC-BY 4.0
  pernyataan_copyright       TEXT,
  metadata_lengkap           BOOLEAN DEFAULT FALSE, -- computed gate
  -- Bidang ilmu (untuk ambang kemutakhiran referensi: 5 vs 10 tahun)
  bidang_ilmu                TEXT CHECK (bidang_ilmu IN ('ilmu_komputer','sains','sosial','pendidikan','bahasa','lainnya')),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 5. PENULIS PER ARTIKEL
-- Indikator 4B (Aspirasi Wawasan): distinct negara penulis
-- Indikator 5A: identitas penulis lengkap & konsisten
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.article_authors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id   UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  urutan       INTEGER NOT NULL,
  nama         TEXT NOT NULL,
  email        TEXT,
  afiliasi     TEXT,
  negara       TEXT, -- kode ISO 3166-1 alpha-2, mis. 'ID','US','MY'
  orcid        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 6. REFERENSI PER ARTIKEL
-- Indikator Referensi Primer (>85% artikel jurnal, min 20 ref)
-- Indikator Kemutakhiran Referensi (>85% dalam 10 tahun, 5 tahun ilmu komputer)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.article_references (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id               UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  urutan                   INTEGER,
  teks_lengkap             TEXT NOT NULL,
  jenis_sumber             TEXT CHECK (jenis_sumber IN ('jurnal','buku','prosiding','website','laporan','lainnya')),
  tahun_terbit             INTEGER,
  terverifikasi_otomatis   BOOLEAN DEFAULT FALSE,
  catatan_verifikasi       TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 7. SITASI ARTIKEL (dari OpenAlex/Crossref)
-- Indikator 4C (Dampak Ilmiah): >30 sitasi skor 8, dsb.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.article_citations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id      UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  sumber_data     TEXT NOT NULL CHECK (sumber_data IN ('openalex','crossref','google_scholar')),
  jumlah_sitasi   INTEGER NOT NULL DEFAULT 0,
  tanggal_tarik   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_response    JSONB
);

-- =============================================================================
-- 8. REVIEWER REGISTRY
-- Indikator 3A (Mitra Bestari): >=4 negara, >50% internasional => skor 6
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.reviewers (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id                 UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  nama                       TEXT NOT NULL,
  email                      TEXT,
  afiliasi                   TEXT,
  negara                     TEXT NOT NULL, -- kode ISO
  -- kualifikasi_internasional: negara != negara penerbit (ID)
  kualifikasi_internasional  BOOLEAN NOT NULL DEFAULT FALSE,
  tautan_orcid               TEXT,
  tautan_scopus              TEXT,
  tautan_google_scholar      TEXT,
  status_aktif               BOOLEAN NOT NULL DEFAULT TRUE,
  tanggal_bergabung          DATE,
  tanggal_terakhir_aktif     DATE,
  bidang_keahlian            TEXT[],
  catatan                    TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 9. EDITORIAL BOARD (Dewan Penyunting)
-- Indikator 3B: >=4 negara, >50% internasional => skor 5
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.editorial_board_members (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id                 UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  nama                       TEXT NOT NULL,
  email                      TEXT,
  afiliasi                   TEXT,
  negara                     TEXT NOT NULL,
  kualifikasi_internasional  BOOLEAN NOT NULL DEFAULT FALSE,
  jabatan                    TEXT, -- mis. Editor-in-Chief, Section Editor, etc.
  tautan_orcid               TEXT,
  tautan_scopus              TEXT,
  tautan_google_scholar      TEXT,
  status_aktif               BOOLEAN NOT NULL DEFAULT TRUE,
  tanggal_bergabung          DATE,
  bidang_keahlian            TEXT[],
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 10. KARTU KESIAPAN NASKAH (Protokol B — Review Evidence Tracker)
-- Modul 3: jejak klinik artikel per artikel
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.article_readiness_cards (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id                      UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tanggal_review_revisi_pertama   DATE,
  tanggal_klinik                  DATE,
  -- Checklist pendampingan per bagian (Klinik Artikel BAB 4.1 PENDALAMAN)
  chk_judul_abstrak               BOOLEAN DEFAULT FALSE,
  chk_novelty_kontribusi          BOOLEAN DEFAULT FALSE,
  chk_referensi                   BOOLEAN DEFAULT FALSE,
  chk_analisis_simpulan           BOOLEAN DEFAULT FALSE,
  persetujuan_penulis             BOOLEAN DEFAULT FALSE,
  catatan_editor                  TEXT,
  dibuat_oleh                     UUID REFERENCES public.user_profiles(id),
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 11. SKOR ESTIMASI (Tabel sentral — output algoritma BAB 5.3)
-- Sumber: otomatis | estimasi_ai | verifikasi_manusia
-- WAJIB ada: versi_rubrik + disclaimer
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.score_estimates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- entitas bisa journal, edition, atau article
  entitas_id      UUID NOT NULL,
  entitas_tipe    TEXT NOT NULL CHECK (entitas_tipe IN ('jurnal','edisi','artikel')),
  indikator_kode  TEXT NOT NULL,   -- mis. '3A','4B','4C','referensi_primer'
  indikator_nama  TEXT,
  skor            NUMERIC(5,2),
  skor_maks       NUMERIC(5,2) NOT NULL,
  sumber          TEXT NOT NULL CHECK (sumber IN ('otomatis','estimasi_ai','verifikasi_manusia','belum_diisi')),
  versi_rubrik    TEXT NOT NULL DEFAULT 'Instrumen Periode II 2025',
  catatan         TEXT,
  tanggal_hitung  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 12. DESK EVALUATION (Protokol H — 8 syarat administratif)
-- Gagal di sini = jurnal tidak dinilai substansinya sama sekali
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.desk_evaluation_checks (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id                   UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  tanggal_cek                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dibuat_oleh                  UUID REFERENCES public.user_profiles(id),
  -- 8 item desk evaluation (MASTER_SYSTEM_PROMPT Lampiran A)
  item_1_nama_issn             BOOLEAN, -- nama & e-ISSN sesuai ISSN BRIN
  item_2_url_benar             BOOLEAN, -- URL terdaftar mengarah tepat
  item_3_status_sinta          BOOLEAN, -- status Sinta sesuai jenis pengajuan
  item_4_masa_berlaku          BOOLEAN, -- masa berlaku terjaga
  item_5_etika_cope            BOOLEAN, -- etika mengacu COPE
  item_6_akun_demo             BOOLEAN, -- akun demo asesor berfungsi
  item_7_frekuensi_terbit      BOOLEAN, -- frekuensi terbit sesuai ISSN
  item_8_min_artikel_pdf       BOOLEAN, -- >=5 artikel/edisi dengan PDF terunduh
  -- Computed: AND semua item
  status_keseluruhan           BOOLEAN GENERATED ALWAYS AS (
    item_1_nama_issn AND item_2_url_benar AND item_3_status_sinta AND
    item_4_masa_berlaku AND item_5_etika_cope AND item_6_akun_demo AND
    item_7_frekuensi_terbit AND item_8_min_artikel_pdf
  ) STORED,
  catatan                      TEXT
);

-- =============================================================================
-- 13. KUNJUNGAN SITUS (Statistik)
-- Indikator 8A: >50 kunjungan unik/hari => skor 3
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.site_visits (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id       UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  tanggal          DATE NOT NULL,
  jumlah_unik      INTEGER NOT NULL DEFAULT 0,
  negara_asal      TEXT[], -- array kode negara
  durasi_rata_rata INTEGER, -- detik
  sumber_data      TEXT DEFAULT 'manual',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (journal_id, tanggal)
);

-- =============================================================================
-- 14. AUDIT LOG (Prinsip audit-first BAB 16.2)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabel_nama   TEXT NOT NULL,
  operasi      TEXT NOT NULL CHECK (operasi IN ('INSERT','UPDATE','DELETE')),
  entitas_id   UUID,
  data_lama    JSONB,
  data_baru    JSONB,
  dilakukan_oleh UUID REFERENCES public.user_profiles(id),
  dilakukan_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address   INET,
  keterangan   TEXT
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_editions_journal ON public.editions(journal_id);
CREATE INDEX IF NOT EXISTS idx_articles_edition ON public.articles(edition_id);
CREATE INDEX IF NOT EXISTS idx_article_authors_article ON public.article_authors(article_id);
CREATE INDEX IF NOT EXISTS idx_article_authors_negara ON public.article_authors(negara);
CREATE INDEX IF NOT EXISTS idx_article_references_article ON public.article_references(article_id);
CREATE INDEX IF NOT EXISTS idx_article_citations_article ON public.article_citations(article_id);
CREATE INDEX IF NOT EXISTS idx_reviewers_journal ON public.reviewers(journal_id);
CREATE INDEX IF NOT EXISTS idx_reviewers_negara ON public.reviewers(negara);
CREATE INDEX IF NOT EXISTS idx_editorial_board_journal ON public.editorial_board_members(journal_id);
CREATE INDEX IF NOT EXISTS idx_score_estimates_entitas ON public.score_estimates(entitas_id, entitas_tipe, indikator_kode);
CREATE INDEX IF NOT EXISTS idx_desk_eval_journal ON public.desk_evaluation_checks(journal_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_journal_tanggal ON public.site_visits(journal_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entitas ON public.audit_logs(entitas_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- All tables: only authenticated internal users (no public access)
-- =============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_readiness_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.desk_evaluation_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Internal access policy (administrator, journal_manager, editor)
-- NO public/anonymous access (BAB 8 — no public portal)

CREATE POLICY "internal_read" ON public.journals FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));
CREATE POLICY "internal_write" ON public.journals FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager'));

CREATE POLICY "internal_read" ON public.editions FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));
CREATE POLICY "internal_write" ON public.editions FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));

CREATE POLICY "internal_read" ON public.articles FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));
CREATE POLICY "internal_write" ON public.articles FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));

CREATE POLICY "internal_all" ON public.article_authors FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));
CREATE POLICY "internal_all" ON public.article_references FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));
CREATE POLICY "internal_all" ON public.article_citations FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));

CREATE POLICY "internal_read" ON public.reviewers FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));
CREATE POLICY "manager_write" ON public.reviewers FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager'));

CREATE POLICY "internal_read" ON public.editorial_board_members FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));
CREATE POLICY "manager_write" ON public.editorial_board_members FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager'));

CREATE POLICY "internal_all" ON public.article_readiness_cards FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));

CREATE POLICY "internal_read" ON public.score_estimates FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));
CREATE POLICY "internal_write" ON public.score_estimates FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager'));

CREATE POLICY "manager_all" ON public.desk_evaluation_checks FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager'));

CREATE POLICY "internal_all" ON public.site_visits FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager'));

CREATE POLICY "read_own_profile" ON public.user_profiles FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' IN ('administrator','journal_manager'));
CREATE POLICY "admin_write_profiles" ON public.user_profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'administrator');

CREATE POLICY "admin_read_audit" ON public.audit_logs FOR SELECT
  USING (auth.jwt() ->> 'role' = 'administrator');

-- =============================================================================
-- UPDATED_AT triggers
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_journals_updated_at
  BEFORE UPDATE ON public.journals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_editions_updated_at
  BEFORE UPDATE ON public.editions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_reviewers_updated_at
  BEFORE UPDATE ON public.reviewers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_editorial_board_updated_at
  BEFORE UPDATE ON public.editorial_board_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_readiness_cards_updated_at
  BEFORE UPDATE ON public.article_readiness_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
