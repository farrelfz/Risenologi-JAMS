import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xckdnwlqdvxeknsgiaoz.supabase.co";
const key = process.env.SUPABASE_SECRET_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(url, key);

async function run() {
  const { data } = await supabase.from("articles").select("*").limit(1);
  console.log(data);
}
run();
