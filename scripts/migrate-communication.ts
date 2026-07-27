import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

async function main() {
  console.log("Starting M18 migration on hosted Supabase...");
  console.log("URL:", supabaseUrl);

  const migrationPath = path.join(
    process.cwd(),
    "supabase/migrations/20260727091500_create_m18_communication_schema.sql",
  );
  const sql = fs.readFileSync(migrationPath, "utf8");

  console.log("Reading migration file. SQL length:", sql.length);

  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: {
      apikey: supabaseSecretKey,
      Authorization: `Bearer ${supabaseSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql }),
  });

  const responseText = await res.text();
  if (res.ok) {
    console.log("✅ Migration executed successfully!");
    console.log("Response:", responseText);
  } else {
    console.error("❌ Migration failed!");
    console.error("Status:", res.status);
    console.error("Error:", responseText);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error in migration:", err);
  process.exit(1);
});
