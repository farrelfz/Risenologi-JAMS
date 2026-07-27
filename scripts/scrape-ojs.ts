import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to extract via regex
function extract(regex: RegExp, text: string): string | null {
  const match = regex.exec(text);
  return match ? match[1].trim() : null;
}

async function scrape() {
  console.log("Fetching archive page...");
  const archiveHtml = await (
    await fetch("https://journal.unj.ac.id/unj/index.php/risenologi/issue/archive")
  ).text();

  // Find issue links
  const issueRegex = /<a class="title"\s+href="([^"]+)">/g;
  let match;
  const issueLinks = [];
  while ((match = issueRegex.exec(archiveHtml)) !== null) {
    issueLinks.push(match[1]);
  }

  console.log(`Found ${issueLinks.length} issues.`);

  for (const issueLink of issueLinks) {
    console.log(`Fetching issue: ${issueLink}`);
    const issueHtml = await (await fetch(issueLink)).text();

    // Find article links
    const articleRegex = /<h3 class="title">\s*<a[^>]+href="([^"]+)">/g;
    let artMatch;
    const articleLinks = [];
    while ((artMatch = articleRegex.exec(issueHtml)) !== null) {
      articleLinks.push(artMatch[1]);
    }

    for (const articleLink of articleLinks) {
      console.log(`Fetching article: ${articleLink}`);
      try {
        const artHtml = await (await fetch(articleLink)).text();

        // Extract title
        const titleRegex = /<h1 class="page_title">\s*(.*?)\s*<\/h1>/s;
        const titleMatch = extract(titleRegex, artHtml);

        // Extract abstract
        const abstractRegex =
          /<section class="item abstract">\s*<h3 class="label">Abstract<\/h3>\s*(.*?)<\/section>/s;
        let abstractStr = extract(abstractRegex, artHtml);

        if (abstractStr) {
          // Clean HTML tags
          abstractStr = abstractStr.replace(/<[^>]*>?/gm, "").trim();
        }

        // Extract DOI
        const doiRegex =
          /<section class="item doi">\s*<span class="label">\s*DOI:\s*<\/span>\s*<span class="value">\s*<a href="([^"]+)">/s;
        let doiMatch = extract(doiRegex, artHtml);
        if (doiMatch) {
          // Usually returns full url like https://doi.org/10.47028/...
          doiMatch = doiMatch.replace("https://doi.org/", "").replace("http://doi.org/", "");
        }

        if (titleMatch && abstractStr) {
          // Find article in db with matching title
          // The title from OJS might have html entities or slight spacing differences, so we use ilike or simple fetch
          const { data: dbArticles } = await supabase
            .from("articles")
            .select("id, judul, abstrak, doi")
            .filter("abstrak", "is", "null");

          if (dbArticles) {
            for (const dbArt of dbArticles) {
              // Simple similarity check
              const dbTitleClean = dbArt.judul.toLowerCase().replace(/[^a-z0-9]/g, "");
              const scrapedTitleClean = titleMatch.toLowerCase().replace(/[^a-z0-9]/g, "");

              if (dbTitleClean === scrapedTitleClean) {
                console.log(`MATCH FOUND: ${dbArt.judul}`);
                const updates: any = { abstrak: abstractStr };
                if (doiMatch) updates.doi = doiMatch;

                const { error } = await supabase
                  .from("articles")
                  .update(updates)
                  .eq("id", dbArt.id);
                if (!error) {
                  console.log(`Successfully updated ${dbArt.judul}`);
                } else {
                  console.log(`Error updating: ${error.message}`);
                }
              }
            }
          }
        }
      } catch (e) {
        console.error(`Failed to scrape article ${articleLink}`, e);
      }

      // Delay to be polite
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

scrape()
  .then(() => console.log("Done"))
  .catch(console.error);
