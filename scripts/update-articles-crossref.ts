import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAbstract(html: string) {
  if (!html) return html;
  return html.replace(/<\/?jats:p[^>]*>/gi, "").trim();
}

async function run() {
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, judul, abstrak, doi, status");

  if (error || !articles) {
    console.error("Error fetching articles:", error);
    return;
  }

  console.log(`Found ${articles.length} articles to process.`);

  for (const article of articles) {
    console.log(`Processing: "${article.judul}"`);

    // Fetch from crossref
    let newAbstract = article.abstrak;
    let newDoi = article.doi;
    let crossrefFound = false;

    try {
      const url = `https://api.crossref.org/works?query.title=${encodeURIComponent(article.judul)}&select=title,abstract,DOI&rows=3`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const items = data.message?.items || [];

        // Find the best match
        const match = items.find((item: any) => {
          const itemTitle = Array.isArray(item.title) ? item.title[0] : item.title;
          return itemTitle && itemTitle.toLowerCase() === article.judul.toLowerCase();
        });

        // Fallback to first item if it's very close
        const bestItem = match || (items.length > 0 ? items[0] : null);

        if (bestItem) {
          if (bestItem.abstract) {
            newAbstract = await cleanAbstract(bestItem.abstract);
            crossrefFound = true;
          }
          if (bestItem.DOI) {
            newDoi = bestItem.DOI;
          }
        }
      }
    } catch (e) {
      console.log(`Failed to fetch from crossref for ${article.judul}`);
    }

    const updates: any = {
      status: "terbit",
    };

    if (newAbstract && newAbstract !== article.abstrak) {
      updates.abstrak = newAbstract;
    }

    if (newDoi && newDoi !== article.doi) {
      updates.doi = newDoi;
    }

    const { error: updateError } = await supabase
      .from("articles")
      .update(updates)
      .eq("id", article.id);

    if (updateError) {
      console.error(`Failed to update article ${article.id}:`, updateError);
    } else {
      console.log(`Updated article ${article.id}. Crossref abstract found: ${crossrefFound}`);
    }

    // sleep to respect API limits
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log("Done updating articles.");
}

run();
