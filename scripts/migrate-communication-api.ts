import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

async function main() {
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  console.log("Project Ref:", projectRef);

  const migrationPath = path.join(
    process.cwd(),
    "supabase/migrations/20260727091500_create_m18_communication_schema.sql",
  );
  const sql = fs.readFileSync(migrationPath, "utf8");

  console.log("SQL Query Length:", sql.length);

  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${supabaseSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await res.text();
  if (res.ok) {
    console.log("✅ Migration succeeded via API!");
    console.log("Response:", body);
  } else {
    console.error("❌ Migration failed via API!");
    console.error("Status:", res.status);
    console.error("Error Response:", body);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
