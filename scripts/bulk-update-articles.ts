import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

  console.log(`Updated ${data?.length || 0} articles to "terbit".`);

  // also fetch all articles to check abstracts
  const { data: allData } = await supabase.from("articles").select("id, judul, abstrak");

  if (allData) {
    const missingAbstracts = allData.filter((d) => !d.abstrak || d.abstrak.trim() === "");
    console.log(
      `${missingAbstracts.length} out of ${allData.length} total articles still have empty abstracts.`,
    );
    if (missingAbstracts.length > 0) {
      console.log("Here are a few with missing abstracts:");
      console.log(
        missingAbstracts
          .slice(0, 3)
          .map((m) => m.judul)
          .join("\n"),
      );
    }
  }
}

run();
