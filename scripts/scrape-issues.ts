import * as cheerio from "cheerio";

async function run() {
  const res = await fetch("https://journal.unj.ac.id/unj/index.php/risenologi/issue/archive");
  const html = await res.text();
  const $ = cheerio.load(html);

  const issues = [];
  $(".title").each((i, el) => {
    const link = $(el).attr("href");
    const title = $(el).text().trim();
    if (link) issues.push({ title, link });
  });

  console.log("Issues found:", issues);
}
run();
