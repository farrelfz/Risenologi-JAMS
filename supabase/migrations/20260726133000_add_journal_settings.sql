-- Add missing columns for Journal Settings

ALTER TABLE public.journals ADD COLUMN IF NOT EXISTS penerbit TEXT;
ALTER TABLE public.journals ADD COLUMN IF NOT EXISTS target_sinta TEXT CHECK (target_sinta IN ('sinta_1','sinta_2','sinta_3','sinta_4','sinta_5','sinta_6','tidak_terakreditasi'));
