-- =============================================================================
-- RISENOLOGI JAMS — M18 Internal Communication Schema (Rilis 1 - MVP)
-- =============================================================================

-- 1. Alter existing tables to add contact columns and consent
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(32);
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS whatsapp_consent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS whatsapp_consent_at TIMESTAMPTZ;

ALTER TABLE public.article_authors ADD COLUMN IF NOT EXISTS phone_number VARCHAR(32);
ALTER TABLE public.article_authors ADD COLUMN IF NOT EXISTS whatsapp_consent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.article_authors ADD COLUMN IF NOT EXISTS whatsapp_consent_at TIMESTAMPTZ;

ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS phone_number VARCHAR(32);
ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS whatsapp_consent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS whatsapp_consent_at TIMESTAMPTZ;

-- 2. Create message_template table
CREATE TABLE IF NOT EXISTS public.message_template (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_code         VARCHAR(100) NOT NULL,
    channel             VARCHAR(20) NOT NULL,
    language            VARCHAR(10) NOT NULL DEFAULT 'id',
    variant_name        VARCHAR(50) NOT NULL DEFAULT 'formal',
    subject_template    TEXT,
    body_template       TEXT NOT NULL,
    whatsapp_registered_template TEXT,
    version             INTEGER NOT NULL DEFAULT 1,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_by          UUID REFERENCES public.user_profiles(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(action_code, channel, language, variant_name, version)
);

-- 3. Create communication_action table
CREATE TABLE IF NOT EXISTS public.communication_action (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id          UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    action_code         VARCHAR(100) NOT NULL,
    sub_stage_at_trigger SMALLINT NOT NULL,
    triggered_by        UUID NOT NULL REFERENCES public.user_profiles(id),
    target_id           UUID NOT NULL,
    target_type         VARCHAR(20) NOT NULL, -- 'editorial_member','author','reviewer'
    channel             VARCHAR(20) NOT NULL, -- 'email','whatsapp'
    template_id         UUID REFERENCES public.message_template(id),
    draft_content       TEXT NOT NULL,
    final_content       TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'drafted',
    failure_reason      TEXT,
    provider_message_id VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at             TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_comm_action_article ON public.communication_action(article_id);
CREATE INDEX IF NOT EXISTS idx_comm_action_status ON public.communication_action(status);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.message_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_action ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies
-- message_template: read by authenticated internal roles, write by administrator / journal_manager
CREATE POLICY "internal_read" ON public.message_template FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));

CREATE POLICY "manager_write" ON public.message_template FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager'));

-- communication_action: read/write by authenticated internal roles
CREATE POLICY "internal_all" ON public.communication_action FOR ALL
  USING (auth.jwt() ->> 'role' IN ('administrator','journal_manager','editor'));

-- 6. Seed data for 6 initial templates
INSERT INTO public.message_template (action_code, channel, language, variant_name, subject_template, body_template)
VALUES
('notify_submission_received', 'email', 'id', 'formal', 
 '[Risenologi JAMS] Konfirmasi Penerimaan Naskah: {{article_title}}',
 'Kepada Yth. Bapak/Ibu {{author_name}},\n\nTerima kasih telah mengirimkan naskah Anda yang berjudul "{{article_title}}" ke jurnal kami. Kami mengonfirmasi bahwa naskah telah berhasil diterima pada tanggal {{submission_date}}.\n\nNaskah Anda saat ini sedang melalui tahapan evaluasi awal (desk evaluation). Kami akan segera mengabarkan progres berikutnya melalui sistem JAMS.\n\nSalam hangat,\nTim Editorial JAMS'),

('request_revision', 'email', 'id', 'formal',
 '[Risenologi JAMS] Permintaan Revisi Naskah: {{article_title}}',
 'Kepada Yth. Bapak/Ibu {{author_name}},\n\nBerdasarkan hasil proses review naskah Anda yang berjudul "{{article_title}}", kami meminta Anda untuk melakukan revisi sesuai masukan reviewer yang dapat Anda lihat di sistem JAMS.\n\nMohon kirimkan kembali naskah hasil revisi Anda sebelum tanggal {{revision_deadline}}.\n\nSalam hangat,\nTim Editorial JAMS'),

('assign_reviewer', 'email', 'id', 'formal',
 '[Risenologi JAMS] Permohonan Peninjauan Naskah (Reviewer Invitation)',
 'Kepada Yth. Bapak/Ibu {{reviewer_name}},\n\nKami dengan hormat mengundang Anda untuk bertindak sebagai reviewer untuk naskah berikut:\nJudul: {{article_title}}\nAbstrak: {{article_abstract}}\n\nApabila Anda bersedia meninjau naskah ini, mohon lakukan konfirmasi melalui tautan sistem JAMS dan selesaikan review sebelum {{review_deadline}}.\n\nTerima kasih atas kontribusi berharga Anda.\n\nSalam hangat,\nEditor JAMS'),

('remind_reviewer_deadline', 'email', 'id', 'formal',
 '[Risenologi JAMS] Pengingat Batas Waktu Tinjauan Naskah',
 'Kepada Yth. Bapak/Ibu {{reviewer_name}},\n\nIni adalah pengingat bahwa batas waktu untuk menyelesaikan review naskah "{{article_title}}" adalah tanggal {{review_deadline}}.\n\nKami sangat mengharapkan masukan berharga Anda untuk menjaga kualitas terbitan jurnal kami.\n\nSalam hangat,\nEditor JAMS'),

('notify_editorial_decision', 'email', 'id', 'formal',
 '[Risenologi JAMS] Keputusan Editorial Naskah: {{article_title}}',
 'Kepada Yth. Bapak/Ibu {{author_name}},\n\nKami dengan senang hati mengumumkan bahwa naskah Anda yang berjudul "{{article_title}}" telah dinyatakan DITERIMA (ACCEPTED) untuk diterbitkan di edisi Volume {{edition_volume}} Nomor {{edition_number}} ({{edition_year}}).\n\nLangkah selanjutnya adalah proses layouting dan proofreading. Terima kasih atas kerja sama yang baik.\n\nSalam hangat,\nEditor in Chief JAMS'),

('notify_publication_to_author', 'email', 'id', 'formal',
 '[Risenologi JAMS] Publikasi Artikel: {{article_title}}',
 'Kepada Yth. Bapak/Ibu {{author_name}},\n\nDengan bangga kami menginformasikan bahwa artikel Anda yang berjudul "{{article_title}}" telah resmi DITERBITKAN secara online pada Edisi Volume {{edition_volume}} Nomor {{edition_number}} ({{edition_year}}).\n\nAnda dapat mengakses artikel Anda melalui repositori JAMS dengan DOI: {{article_doi}}.\n\nTerima kasih atas kontribusi ilmiah Anda pada Risenologi JAMS.\n\nSalam hangat,\nEditor in Chief JAMS')
ON CONFLICT (action_code, channel, language, variant_name, version) DO NOTHING;
