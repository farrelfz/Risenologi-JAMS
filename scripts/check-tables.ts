import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

async function createTable(name: string, sql: string) {
  const { error } = await (supabase as any).from("_sql").select(`*`).limit(0);
  // Use pg REST directly
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SECRET_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql }),
  });
  const text = await res.text();
  if (res.ok) console.log(`✅ ${name}`);
  else console.log(`⚠️  ${name}: ${text}`);
}

async function migrate() {
  console.log("Checking existing tables via direct Supabase...\n");

  // Check which tables exist
  const tables = ["score_estimates", "audit_logs", "compliance_checks", "review_evidence"];
  for (const table of tables) {
    const { error } = await (supabase as any).from(table).select("id").limit(1);
    if (!error || error.code === "PGRST116") {
      console.log(`✅ ${table} — exists`);
    } else {
      console.log(`❌ ${table} — MISSING (code: ${error.code}): ${error.message}`);
    }
  }

  // Check reviewers columns
  const { data: rev, error: revErr } = await supabase.from("reviewers").select("*").limit(1);
  if (rev && rev[0]) {
    const cols = Object.keys(rev[0]);
    console.log("\nReviewers columns:", cols.join(", "));
    const hasScopus = cols.includes("scopus_url");
    const hasOrcid = cols.includes("orcid");
    const hasQualLevel = cols.includes("qualification_level");
    console.log("  scopus_url:", hasScopus ? "✅" : "❌");
    console.log("  orcid:", hasOrcid ? "✅" : "❌");
    console.log("  qualification_level:", hasQualLevel ? "✅" : "❌");
  } else {
    console.log("Reviewers sample:", revErr?.message);
  }
}

migrate().catch(console.error);
