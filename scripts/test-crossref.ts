async function test() {
  const title =
    "A Numerical Simulation Study of a Wind–Rain Synergy System (WRSS) for Multi–Source Maritime Renewable Energy Harvesting Using Predictive Dynamic Positioning in Indonesian Waters";
  const url = `https://api.crossref.org/works?query.title=${encodeURIComponent(title)}&select=title,abstract,DOI&rows=1`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data.message.items, null, 2));
}
test();
