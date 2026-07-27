import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY!;

// Use the pg-meta or management API to run DDL
// Since Supabase doesn't expose exec_sql by default, we use the pg REST approach with the DB URL
// Instead, let's insert directly via the existing tables approach
// OR we can use supabase management API

async function runSQL(sql: string, description: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: "HEAD",
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });

  // Try using the pg-meta endpoint
  const pgMeta = await fetch(
    `${SUPABASE_URL.replace("supabase.co", "supabase.co")}/pg-meta/v1/query`,
    {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    },
  );

  const body = await pgMeta.text();
  if (pgMeta.ok) {
    console.log(`✅ ${description}`);
  } else {
    console.log(`ℹ️  ${description}: ${pgMeta.status} ${body.substring(0, 200)}`);
  }
}

async function main() {
  // Try Supabase Management API
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  console.log("Project ref:", projectRef);

  const sqls = [
    {
      desc: "Create compliance_checks",
      sql: `CREATE TABLE IF NOT EXISTS public.compliance_checks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        journal_id UUID REFERENCES public.journals(id) ON DELETE CASCADE,
        check_type TEXT NOT NULL,
        check_name TEXT NOT NULL,
        result TEXT NOT NULL DEFAULT 'pending',
        evidence_ref TEXT,
        notes TEXT,
        checked_at TIMESTAMPTZ DEFAULT now(),
        checked_by UUID
      );`,
    },
    {
      desc: "Create review_evidence",
      sql: `CREATE TABLE IF NOT EXISTS public.review_evidence (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
        reviewer_id UUID REFERENCES public.reviewers(id),
        classified_as TEXT DEFAULT 'tidak_ada',
        evidence_text TEXT,
        confidence_score NUMERIC(3,2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );`,
    },
    {
      desc: "Add reviewers.scopus_url",
      sql: `ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS scopus_url TEXT;`,
    },
    {
      desc: "Add reviewers.orcid",
      sql: `ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS orcid TEXT;`,
    },
    {
      desc: "Add reviewers.qualification_level",
      sql: `ALTER TABLE public.reviewers ADD COLUMN IF NOT EXISTS qualification_level TEXT DEFAULT 'nasional';`,
    },
  ];

  for (const { desc, sql } of sqls) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });
    const body = await res.text();
    if (res.ok) console.log(`✅ ${desc}`);
    else console.log(`❌ ${desc}: ${res.status} ${body.substring(0, 300)}`);
  }
}

main().catch(console.error);
