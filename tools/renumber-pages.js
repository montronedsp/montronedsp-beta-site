const fs = require('fs');
const RU = require('path').join(__dirname, '..', 'martello-manual-ru.html');
let html = fs.readFileSync(RU, 'utf8');
let pages = html.match(/<section class="page">[\s\S]*?(?=<section class="page">|$)/g);
let n = 0;
pages = pages.map((p) => {
  const f = p.match(/folio-top">([^<]+)</)?.[1];
  if (f === 'ii' || f === 'iii') return p;
  n++;
  return p.replace(/folio-top">[^<]+</, `folio-top">${n}<`).replace(/page-no">[^<]+</, `page-no">${n}<`);
});
html = html.slice(0, html.indexOf('<section class="page">')) + pages.join('');
fs.writeFileSync(RU, html);
console.log('Renumbered. Numeric pages:', n);
