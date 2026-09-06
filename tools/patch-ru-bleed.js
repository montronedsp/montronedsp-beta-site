const fs = require('fs');
const RU_FILE = require('path').join(__dirname, '..', 'martello-manual-ru.html');
const FOOTER = 'Martello — Руководство пользователя';

function getPages(html) {
  return html.match(/<section class="page">[\s\S]*?(?=<section class="page">|$)/g) || [];
}

function setPages(html, pages) {
  return html.slice(0, html.indexOf('<section class="page">')) + pages.join('');
}

function parseCols(page) {
  const m = page.match(/<div class="cols[^"]*"([^>]*)>\s*([\s\S]*?)<\/div>\s*\n\s*<\/div>\s*\n[\s\S]*?<div class="footer">/);
  const parts = m[2].split(/<div class="col">/).slice(1);
  return {
    col1: parts[0]?.trim() || '',
    col2: parts[1]?.trim() || '',
    runningHead: page.match(/running-head">([^<]+)</)?.[1] || 'Модели ударных',
    title: page.match(/<h1 class="title">([^<]+)</)?.[1] || null,
  };
}

function mkPage({ runningHead, title, colsClass = 'dense2', colsStyle = 'margin-top:23mm;', col1, col2 }) {
  const titleBlock = title ? `  <h1 class="title">${title}</h1><div class="rule"></div>\n` : '';
  const style = title ? '' : colsStyle;
  return `<section class="page">
  <div class="folio-top">0</div><div class="running-head">${runningHead}</div>
${titleBlock}  <div class="cols ${colsClass}" style="${style}">
    <div class="col">
${col1 || ''}
    </div>
    <div class="col">
${col2 || ''}
    </div>
  </div>
  <div class="footer"><span>${FOOTER}</span><span class="page-no">0</span></div>
</section>
`;
}

function renumber(pages) {
  let n = 0;
  return pages.map((p) => {
    const f = p.match(/folio-top">([^<]+)</)?.[1];
    if (f === 'ii' || f === 'iii') return p;
    n++;
    return p.replace(/folio-top">[^<]+</, `folio-top">${n}<`).replace(/page-no">[^<]+</, `page-no">${n}<`);
  });
}

function splitPageAtMarker(pages, folio, marker, runningHead) {
  const i = pages.findIndex((p) => p.match(/folio-top">(\d+)</)?.[1] === String(folio));
  if (i === -1) return pages;
  const page = pages[i];
  const p = parseCols(page);
  const head = runningHead || p.runningHead;
  for (const colKey of ['col1', 'col2']) {
    const col = p[colKey];
    const idx = col.indexOf(marker);
    if (idx !== -1) {
      const before = col.slice(0, idx).trim();
      const after = col.slice(idx).trim();
      const other = colKey === 'col1' ? p.col2 : p.col1;
      const pg1 = colKey === 'col1'
        ? mkPage({ runningHead: head, title: p.title, col1: before, col2: other })
        : mkPage({ runningHead: head, title: p.title, col1: p.col1, col2: before });
      const pg2 = mkPage({ runningHead: head, col1: after, col2: '' });
      pages.splice(i, 1, pg1, pg2);
      return pages;
    }
  }
  return pages;
}

let html = fs.readFileSync(RU_FILE, 'utf8');
let pages = getPages(html);

pages = splitPageAtMarker(pages, 20, '<div class="section compact"><h3>Cymbal</h3>');
pages = renumber(pages);
pages = splitPageAtMarker(pages, 31, '<div class="section compact"><h3>Модуляция и пресеты</h3>', 'Модуляция');
pages = renumber(pages);

html = setPages(html, pages);
fs.writeFileSync(RU_FILE, html, 'utf8');
console.log('Done. Numeric pages:', pages.filter((p) => !/folio-top">(ii|iii)</.test(p)).length);
