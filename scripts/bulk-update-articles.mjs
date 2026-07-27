import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
);

async function run() {
  const { data, error } = await supabase
    .from("articles")
    .update({ status: "terbit" })
    .neq("status", "terbit")
    .select("id, judul, abstrak");

  if (error) {
    console.error("Error updating articles:", error);
    return;
  }

  console.log(`Updated ${data.length} articles to "terbit".`);
  const missingAbstracts = data.filter((d) => !d.abstrak || d.abstrak.trim() === "");
  console.log(`${missingAbstracts.length} articles still have empty abstracts.`);
}

run();
