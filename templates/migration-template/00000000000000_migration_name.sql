-- Migration: [Name]
-- Description: [Brief description]

BEGIN;

CREATE TABLE public.table_name (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Additional columns here
    name TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow internal access" ON public.table_name
    FOR ALL
    USING (auth.jwt() ->> 'role' IN ('administrator', 'journal_manager', 'editor'));

COMMIT;
