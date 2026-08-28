const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const GSC_DIR = path.resolve(ROOT, '..', '..', '..', '..', '..', 'Documents', 'Codex', '2026-05-15', 'you-are-working-on-aftertaxtool-audit', 'creditroadmap-gsc-2026-08-27-expanded');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"' && quoted && next === '"') {
      cell += '"';
      i++;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const header = rows.shift();
  return rows.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] || ''])));
}

function readCsv(name) {
  return parseCsv(fs.readFileSync(path.join(GSC_DIR, name), 'utf8'));
}

function htmlFiles() {
  return fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();
}

function pageMeta(file) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim() || '';
  const desc = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] || '';
  const links = [...html.matchAll(/href="([^"]+\.html)"/g)].map(m => m[1]).filter(h => !/^https?:/i.test(h));
  return { file, title, h1, desc, links };
}

function classifyText(text) {
  const t = text.toLowerCase();
  if (/\bccj\b|county court/.test(t)) return 'CCJs';
  if (/default/.test(t)) return 'Defaults';
  if (/missed|late payment|arrears/.test(t)) return 'Missed and late payments';
  if (/mortgage|deposit|lender|bank statement/.test(t)) return 'Mortgage readiness';
  if (/car finance|pcp|hp finance|car loan/.test(t)) return 'Car finance';
  if (/credit card|balance transfer|unused card|close.*card|card/.test(t)) return 'Credit cards';
  if (/phone|mobile|sim|iphone|broadband|utilities/.test(t)) return 'Mobile and utilities';
  if (/electoral|vote|voter|address/.test(t)) return 'Electoral roll and address';
  if (/utili[sz]ation|credit limit|balance/.test(t)) return 'Utilisation and limits';
  if (/credit report|credit file|credit score|experian|equifax|transunion/.test(t)) return 'Credit reports and scores';
  if (/application|apply|declined|rejected|hard search|soft search|searches/.test(t)) return 'Applications and searches';
  if (/iva|bankruptcy|dmp|debt management|dro|breathing space|arrangement to pay/.test(t)) return 'Debt solutions';
  if (/rent|tenant|landlord|letting/.test(t)) return 'Renting';
  if (/loan|borrowing/.test(t)) return 'Loans';
  return 'Other';
}

const queries = readCsv('Queries.csv').map(r => ({
  query: r['Top queries'],
  clicks: Number(r.Clicks || 0),
  impressions: Number(r.Impressions || 0),
  position: Number(r.Position || 0),
}));
const pages = readCsv('Pages.csv').map(r => ({
  page: r['Top pages'],
  file: r['Top pages'].replace('https://creditroadmap.co.uk/', '') || 'index.html',
  clicks: Number(r.Clicks || 0),
  impressions: Number(r.Impressions || 0),
  position: Number(r.Position || 0),
}));

const files = htmlFiles();
const metas = files.map(pageMeta);
const inbound = Object.fromEntries(files.map(f => [f, 0]));
for (const m of metas) {
  for (const href of m.links) if (href in inbound) inbound[href]++;
}

const families = {};
for (const q of queries) {
  const family = classifyText(q.query);
  families[family] ||= { queries: 0, impressions: 0, weightedPosition: 0, top: [] };
  families[family].queries++;
  families[family].impressions += q.impressions;
  families[family].weightedPosition += q.position * q.impressions;
  families[family].top.push(q);
}
for (const family of Object.values(families)) {
  family.avgPosition = family.impressions ? +(family.weightedPosition / family.impressions).toFixed(2) : 0;
  family.top = family.top.sort((a, b) => b.impressions - a.impressions).slice(0, 12);
  delete family.weightedPosition;
}

const pageRows = pages.map(p => ({
  ...p,
  inbound: inbound[p.file] ?? null,
  exists: files.includes(p.file),
  cluster: classifyText(p.file.replace(/-/g, ' ')),
})).sort((a, b) => b.impressions - a.impressions);

const output = {
  htmlCount: files.length,
  sitemapCount: (fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').match(/<loc>/g) || []).length,
  queryCount: queries.length,
  queryClicks: queries.reduce((s, q) => s + q.clicks, 0),
  queryImpressions: queries.reduce((s, q) => s + q.impressions, 0),
  pagesInGsc: pages.length,
  pageImpressions: pages.reduce((s, p) => s + p.impressions, 0),
  families,
  topPages: pageRows.slice(0, 25),
  weakestIndexed: Object.entries(inbound).sort((a, b) => a[1] - b[1]).slice(0, 25).map(([file, links]) => ({ file, inbound: links, cluster: classifyText(file.replace(/-/g, ' ')) })),
};

fs.writeFileSync(path.join(ROOT, 'docs-creditroadmap-audit-data.json'), JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));
