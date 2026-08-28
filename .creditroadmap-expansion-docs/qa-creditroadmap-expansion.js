const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://creditroadmap.co.uk";

const htmlFiles = fs.readdirSync(ROOT).filter(file => file.endsWith(".html")).sort();
const htmlByFile = Object.fromEntries(htmlFiles.map(file => [file, fs.readFileSync(path.join(ROOT, file), "utf8")]));
const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
const sitemapFiles = sitemapUrls.map(url => url === `${SITE}/` ? "index.html" : url.replace(`${SITE}/`, ""));

function matches(html, re) {
  return [...html.matchAll(re)].map(match => match[1]);
}

function normalizeHref(href) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return null;
  if (/^https?:\/\//i.test(href)) {
    if (!href.startsWith(`${SITE}/`)) return null;
    const local = href === `${SITE}/` ? "index.html" : href.replace(`${SITE}/`, "").split("#")[0].split("?")[0];
    return local || "index.html";
  }
  return href.split("#")[0].split("?")[0] || null;
}

const issues = [];
const links = new Map(htmlFiles.map(file => [file, []]));
const inbound = new Map(htmlFiles.map(file => [file, 0]));
const titles = new Map();
const metas = new Map();
const h1s = new Map();
const canonicals = new Map();
let jsonLdBlocks = 0;

for (const [file, html] of Object.entries(htmlByFile)) {
  const title = (html.match(/<title>(.*?)<\/title>/is) || [])[1];
  const meta = (html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) || [])[1];
  const canonical = (html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i) || [])[1];
  const h1 = matches(html, /<h1[^>]*>(.*?)<\/h1>/gis).map(x => x.replace(/<[^>]+>/g, "").trim());
  if (!title) issues.push(`${file}: missing title`);
  if (!meta) issues.push(`${file}: missing meta description`);
  if (!canonical) issues.push(`${file}: missing canonical`);
  if (h1.length !== 1) issues.push(`${file}: expected 1 H1, found ${h1.length}`);
  if (canonical) {
    const expected = file === "index.html" ? `${SITE}/` : `${SITE}/${file}`;
    if (canonical !== expected) issues.push(`${file}: canonical mismatch ${canonical} expected ${expected}`);
    canonicals.set(canonical, (canonicals.get(canonical) || []).concat(file));
  }
  if (title) titles.set(title, (titles.get(title) || []).concat(file));
  if (meta) metas.set(meta, (metas.get(meta) || []).concat(file));
  if (h1[0]) h1s.set(h1[0], (h1s.get(h1[0]) || []).concat(file));
  if (/noindex|nofollow|unavailable_after|nosnippet/i.test(html)) issues.push(`${file}: suspicious robots directive text`);
  if (/[�]|Â£|â€™|â€“|\?[0-9]{1,3},[0-9]{3}/.test(html)) issues.push(`${file}: suspicious encoding artifact`);

  const scripts = matches(html, /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const script of scripts) {
    jsonLdBlocks += 1;
    try {
      JSON.parse(script);
    } catch (error) {
      issues.push(`${file}: malformed JSON-LD (${error.message})`);
    }
  }

  const hrefs = matches(html, /href=["']([^"']+)["']/gi);
  for (const href of hrefs) {
    const local = normalizeHref(href);
    if (!local) continue;
    links.get(file).push(local);
    if (!fs.existsSync(path.join(ROOT, local))) issues.push(`${file}: broken internal href ${href}`);
  }

  const srcs = matches(html, /src=["']([^"']+)["']/gi);
  for (const src of srcs) {
    if (/^https?:\/\//i.test(src)) continue;
    const local = src.split("?")[0];
    if (!fs.existsSync(path.join(ROOT, local))) issues.push(`${file}: missing asset ${src}`);
  }
}

for (const [file, outs] of links.entries()) {
  for (const target of outs) {
    if (inbound.has(target) && target !== file) inbound.set(target, inbound.get(target) + 1);
  }
}

function duplicateGroups(map) {
  return [...map.entries()].filter(([, files]) => files.length > 1);
}

const sitemapDupes = sitemapUrls.filter((url, i) => sitemapUrls.indexOf(url) !== i);
if (sitemapDupes.length) issues.push(`duplicate sitemap URLs: ${sitemapDupes.join(", ")}`);
for (const file of htmlFiles) {
  if (!sitemapFiles.includes(file)) issues.push(`${file}: missing from sitemap`);
}
for (const file of sitemapFiles) {
  if (!htmlFiles.includes(file)) issues.push(`${file}: sitemap URL has no local file`);
}

const queue = ["index.html"];
const depth = new Map([["index.html", 0]]);
while (queue.length) {
  const file = queue.shift();
  for (const target of links.get(file) || []) {
    if (!htmlByFile[target] || depth.has(target)) continue;
    depth.set(target, depth.get(file) + 1);
    queue.push(target);
  }
}

const unreachable = htmlFiles.filter(file => !depth.has(file));
const orphans = htmlFiles.filter(file => file !== "index.html" && (inbound.get(file) || 0) === 0);
const depths = [...depth.values()].sort((a, b) => a - b);
const p95 = depths[Math.floor(depths.length * 0.95)] || 0;
const maxDepth = depths[depths.length - 1] || 0;
if (unreachable.length) issues.push(`unreachable pages: ${unreachable.join(", ")}`);
if (orphans.length) issues.push(`orphan pages: ${orphans.join(", ")}`);

const duplicateTitles = duplicateGroups(titles);
const duplicateMetas = duplicateGroups(metas);
const duplicateH1s = duplicateGroups(h1s);
if (duplicateTitles.length) issues.push(`duplicate titles: ${duplicateTitles.length} groups`);
if (duplicateMetas.length) issues.push(`duplicate meta descriptions: ${duplicateMetas.length} groups`);
if (duplicateH1s.length) issues.push(`duplicate H1s: ${duplicateH1s.length} groups`);

const manifestPath = path.join(__dirname, "creditroadmap-expansion-manifest.csv");
const expansionPages = fs.readFileSync(manifestPath, "utf8").trim().split(/\r?\n/).slice(1).map(row => {
  const match = row.match(/^"((?:""|[^"])*)"/);
  return match ? match[1].replace(/""/g, '"') : null;
}).filter(Boolean);
const wordCounts = Object.fromEntries(expansionPages.map(file => [
  file,
  htmlByFile[file].replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length
]));

const result = {
  htmlCount: htmlFiles.length,
  sitemapUrlCount: sitemapUrls.length,
  uniqueSitemapUrlCount: new Set(sitemapUrls).size,
  sitemapParity: htmlFiles.length === sitemapUrls.length && sitemapFiles.every(file => htmlFiles.includes(file)) && htmlFiles.every(file => sitemapFiles.includes(file)),
  brokenInternalLinks: issues.filter(issue => issue.includes("broken internal href")).length,
  missingAssets: issues.filter(issue => issue.includes("missing asset")).length,
  duplicateTitleGroups: duplicateTitles.length,
  duplicateMetaGroups: duplicateMetas.length,
  duplicateH1Groups: duplicateH1s.length,
  jsonLdBlocks,
  reachable: depth.size,
  unreachable,
  orphans,
  p95Depth: p95,
  maxDepth,
  minInboundSample: [...inbound.entries()].filter(([file]) => file !== "index.html").sort((a, b) => a[1] - b[1]).slice(0, 15),
  expansionPageCount: expansionPages.length,
  minExpansionWordCount: Math.min(...Object.values(wordCounts)),
  expansionWordCounts: Object.entries(wordCounts).sort((a, b) => a[1] - b[1]).slice(0, 12),
  issues
};

fs.writeFileSync(path.join(__dirname, "creditroadmap-expansion-qa.json"), JSON.stringify(result, null, 2), "utf8");
fs.appendFileSync(path.join(__dirname, "creditroadmap-expansion-qa.md"), `\n## Automated QA Result\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`\n`, "utf8");

console.log(JSON.stringify(result, null, 2));
process.exit(issues.length ? 1 : 0);
