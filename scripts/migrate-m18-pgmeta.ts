import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

async function main() {
  console.log("Sending query to pg-meta...");
  const migrationPath = path.join(
    process.cwd(),
    "supabase/migrations/20260727091500_create_m18_communication_schema.sql",
  );
  const sql = fs.readFileSync(migrationPath, "utf8");

  const pgMetaUrl = `${supabaseUrl}/pg-meta/v1/query`;
  console.log("Endpoint:", pgMetaUrl);

  const res = await fetch(pgMetaUrl, {
    method: "POST",
    headers: {
      apikey: supabaseSecretKey,
      Authorization: `Bearer ${supabaseSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  if (res.ok) {
    console.log("✅ Migration succeeded via pg-meta!");
    console.log("Response:", text);
  } else {
    console.error("❌ Migration failed via pg-meta!");
    console.error("Status:", res.status);
    console.error("Error:", text);
    process.exit(1);
  }
}

main().catch(console.error);
