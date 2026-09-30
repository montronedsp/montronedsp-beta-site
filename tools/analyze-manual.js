const fs = require('fs');
const path = require('path');

const file = process.argv[2] || 'martello-manual-ru.html';
const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

function stripImg(s) {
  return s.replace(/data:image[^"']+/g, '[IMG]');
}

const pageRe = /<section class="page">[\s\S]*?(?=<section class="page">|$)/g;
const pages = html.match(pageRe) || [];

console.log('File:', file, 'Pages:', pages.length);

pages.forEach((p, i) => {
  const folio = p.match(/folio-top">([^<]+)</)?.[1] || '?';
  const head = p.match(/running-head">([^<]+)</)?.[1] || '?';
  const stripped = stripImg(p);
  const h2s = [...stripped.matchAll(/<h2>([^<]+)<\/h2>/g)].map(m => m[1]);
  const h3s = [...stripped.matchAll(/<h3>([^<]+)<\/h3>/g)].map(m => m[1]).slice(0, 8);
  console.log(`\n--- Page folio=${folio} idx=${i} head=${head} len=${p.length} ---`);
  console.log('h2:', h2s.join(' | '));
  console.log('h3:', h3s.join(' | '));
});
