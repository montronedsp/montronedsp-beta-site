const fs = require('fs');
const path = require('path');

const file = process.argv[2] || 'martello-manual-ru.html';
const pageNum = process.argv[3] || '1';
const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

function stripImg(s) {
  return s.replace(/data:image[^"']+/g, '[IMG]');
}

const pageRe = /<section class="page">[\s\S]*?(?=<section class="page">|$)/g;
const pages = html.match(pageRe) || [];

const p = pages.find(x => x.includes(`folio-top">${pageNum}<`));
if (!p) { console.log('Page not found'); process.exit(1); }

console.log(stripImg(p));
