-- ============================================================
-- RISENOLOGI JAMS — Rilis 1 Migration
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. compliance_checks: hasil 8 syarat Desk Evaluation (M1)
CREATE TABLE IF NOT EXISTS public.compliance_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id UUID REFERENCES public.journals(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL,
  check_name TEXT NOT NULL,
  result TEXT NOT NULL DEFAULT 'pending' CHECK (result IN ('pass', 'fail', 'pending')),
  evidence_ref TEXT,
  notes TEXT,
  checked_at TIMESTAMPTZ DEFAULT now(),
  checked_by UUID
);

ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compliance_checks_read" ON public.compliance_checks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "compliance_checks_write" ON public.compliance_checks
  FOR ALL USING (auth.role() = 'authenticated');

-- 2. review_evidence: bukti telaah per naskah (M3)
CREATE TABLE IF NOT EXISTS public.review_evidence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.reviewers(id),
  classified_as TEXT DEFAULT 'tidak_ada' CHECK (classified_as IN ('substantif', 'kosmetik', 'tidak_ada')),
  evidence_text TEXT,
  confidence_score NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.review_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_evidence_read" ON public.review_evidence
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "review_evidence_write" ON public.review_evidence
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. Tambah kolom baru ke reviewers (sudah ada: tautan_scopus, tautan_orcid, tautan_google_scholar)
-- Kolom legacy sudah ada, kita align dengan naming dari Super Max Prompt
-- (kolom lama dipertahankan, kolom baru sebagai alias)
ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS scopus_url TEXT;
ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS gscholar_url TEXT;
ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS orcid TEXT;
ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS qualification_level TEXT DEFAULT 'nasional';

-- Migrate data dari kolom lama ke kolom baru (jika kolom lama sudah terisi)
UPDATE public.reviewers SET
  scopus_url = tautan_scopus,
  gscholar_url = tautan_google_scholar,
  orcid = tautan_orcid,
  qualification_level = CASE WHEN kualifikasi_internasional = true THEN 'internasional' ELSE 'nasional' END
WHERE scopus_url IS NULL;

-- 4. Pastikan score_estimates dan audit_logs punya RLS (jika belum)
ALTER TABLE public.score_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "score_estimates_read" ON public.score_estimates;
CREATE POLICY "score_estimates_read" ON public.score_estimates
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "audit_logs_read" ON public.audit_logs;
CREATE POLICY "audit_logs_read" ON public.audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');
