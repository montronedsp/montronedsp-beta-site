const fs = require('fs');
const path = require('path');

const RU_FILE = path.join(__dirname, '..', 'martello-manual-ru.html');
const FOOTER = 'Martello — Руководство пользователя';

const COMPACT_CSS = `
  html[lang="ru"] #manual-doc{font-size:7.85pt;line-height:1.2;}
  html[lang="ru"] #manual-doc .cols p{margin:0 0 1.45mm 0;line-height:1.22;}
  html[lang="ru"] #manual-doc .section{margin-bottom:3.6mm;}
  html[lang="ru"] #manual-doc .section.compact{margin-bottom:2.4mm;}
`;

function norm(s) {
  return s.replace(/\r\n/g, '\n');
}

function getPages(html) {
  return html.match(/<section class="page">[\s\S]*?(?=<section class="page">|$)/g) || [];
}

function setPages(html, pages) {
  const prefix = html.slice(0, html.indexOf('<section class="page">'));
  return prefix + pages.join('');
}

function extractBetween(html, start, end) {
  const h = norm(html);
  const s = h.indexOf(norm(start));
  if (s === -1) throw new Error(`Start not found: ${start.slice(0, 55)}`);
  const e = h.indexOf(norm(end), s + 1);
  if (e === -1) throw new Error(`End not found: ${end.slice(0, 55)}`);
  return html.slice(s, e).trim();
}

function pageShell({ runningHead, title, colsClass, colsStyle, col1, col2, extra = '' }) {
  const titleBlock = title ? `  <h1 class="title">${title}</h1><div class="rule"></div>\n` : '';
  const style = colsStyle ? ` style="${colsStyle}"` : '';
  const cls = colsClass ? `cols ${colsClass}` : 'cols';
  const c1 = col1 ? `    <div class="col">\n${col1}\n    </div>\n` : '';
  const c2 = col2 ? `    <div class="col">\n${col2}\n    </div>\n` : '';
  return `{FOLIO}{RUN}${titleBlock}  <div class="${cls}"${style}>
${c1}${c2}  </div>
${extra}{FOOTER}`;
}

function finalizePage(template, runningHead) {
  return template
    .replace('{FOLIO}', `  <div class="folio-top">0</div><div class="running-head">${runningHead}</div>\n`)
    .replace('{RUN}', '')
    .replace('{FOOTER}', `  <div class="footer"><span>${FOOTER}</span><span class="page-no">0</span></div>\n</section>\n`);
}

function parseCols(page) {
  const m = page.match(/<div class="cols[^"]*"([^>]*)>\s*([\s\S]*?)<\/div>\s*\n\s*<\/div>\s*\n(?:\s*<div class="model-table-wrap"[\s\S]*?)?(?:\s*<p class="mapping-note"[\s\S]*?)?\s*<div class="footer">/);
  if (!m) throw new Error('cols not found');
  const parts = m[2].split(/<div class="col">/).slice(1);
  const colsTag = page.match(/<div class="cols[^"]*"[^>]*>/)[0];
  const colsStyle = m[1].trim();
  const runningHead = page.match(/running-head">([^<]+)</)?.[1] || '';
  const title = page.match(/<h1 class="title">([^<]+)</)?.[1] || null;
  const extra = page.match(/<\/div>\s*\n\s*<\/div>\s*\n([\s\S]*?)<div class="footer">/)?.[1]?.trim() || '';
  return { col1: parts[0]?.trim() || '', col2: parts[1]?.trim() || '', colsTag, colsStyle, runningHead, title, extra };
}

function mkPage({ runningHead, title, colsClass, colsStyle, col1, col2, extra }) {
  const tpl = pageShell({ runningHead, title, colsClass, colsStyle, col1, col2, extra });
  return finalizePage(`<section class="page">\n${tpl}`, runningHead);
}

function splitColsAt(page, marker, opts = {}) {
  const { colsClass = 'dense2', colsStyle = 'margin-top:23mm;', runningHead, title = null } = opts;
  const p = parseCols(page);
  const head = runningHead || p.runningHead;
  const pgTitle = title === undefined ? p.title : title;
  let p1c1 = p.col1, p1c2 = p.col2, p2c1 = '', p2c2 = '';
  for (const [col, setP1, setP2] of [
    [p.col1, (v) => { p1c1 = v; }, (v) => { p2c1 = v; }],
    [p.col2, (v) => { p1c2 = v; }, (v) => { p2c2 = v; }],
  ]) {
    const i = col.indexOf(marker);
    if (i !== -1) {
      setP1(col.slice(0, i).trim());
      setP2(col.slice(i).trim());
    }
  }
  return [
    mkPage({ runningHead: head, title: pgTitle, colsClass, colsStyle: pgTitle ? '' : colsStyle, col1: p1c1, col2: p1c2, extra: '' }),
    mkPage({ runningHead: head, title: null, colsClass, colsStyle, col1: p2c1, col2: p2c2, extra: '' }),
  ];
}

function findPageIndex(pages, needle) {
  const i = pages.findIndex((p) => p.includes(needle));
  if (i === -1) throw new Error(`Page with ${needle.slice(0, 40)} not found`);
  return i;
}

function renumberPages(pages) {
  let n = 0;
  const roman = { ii: true, iii: true };
  return pages.map((page) => {
    const folio = page.match(/folio-top">([^<]+)</)?.[1];
    if (!folio || roman[folio]) return page;
    n += 1;
    return page
      .replace(/<div class="folio-top">[^<]+<\/div>/, `<div class="folio-top">${n}</div>`)
      .replace(/<span class="page-no">[^<]+<\/span>/, `<span class="page-no">${n}</span>`);
  });
}

function splitIntro(pages) {
  const i = findPageIndex(pages, '<h2>Обзор</h2>');
  const page = pages[i];
  const overview = extractBetween(page, '<div class="section"><h2>Обзор</h2>', '<div class="section"><h2>1. Версии продукта</h2>');
  const martello = extractBetween(page, '<div class="section"><h2>1. Версии продукта</h2>', '<div class="section"><h3>MartelloX2</h3>');
  const mx2prod = extractBetween(page, '<div class="section"><h3>MartelloX2</h3>', '</div>\n    </div>\n    <div class="col">\n      <div class="section"><h2>2. Голоса ударных</h2>');
  const voice = extractBetween(page, '<div class="section"><h2>2. Голоса ударных</h2>', '<div class="section"><h3>Структура голосов MartelloX2</h3>');
  const mx2voice = extractBetween(page, '<div class="section"><h3>Структура голосов MartelloX2</h3>', '<div class="section compact"><h3>Назначение MIDI-нот MartelloX2</h3>');
  const midi = extractBetween(page, '<div class="section compact"><h3>Назначение MIDI-нот MartelloX2</h3>', '</div>\n    </div>\n  </div>\n  <div class="footer">') + '</div>';
  const newPages = [
    mkPage({ runningHead: 'Введение', title: 'Введение', col1: overview, col2: martello }),
    mkPage({ runningHead: 'Введение', title: 'Введение', col1: mx2prod, col2: voice }),
    mkPage({ runningHead: 'Введение', title: 'Введение', col1: mx2voice, col2: midi }),
  ];
  pages.splice(i, 1, ...newPages);
}

function splitDrumModels(pages) {
  const i = findPageIndex(pages, '<h2>3. Модели ударных</h2>');
  const page = pages[i];
  const sec3 = extractBetween(page, '<div class="section"><h2>3. Модели ударных</h2>', '<div class="section compact"><h2>4. Модели Classic</h2>');
  const sec4 = extractBetween(page, '<div class="section compact"><h2>4. Модели Classic</h2>', '</div>\n    </div>\n    <div class="col">');
  const col2 = extractBetween(page, '    <div class="col">\n      <div class="screenshot small">', '    </div>\n  </div>\n  <div class="model-table-wrap"');
  const tableExtra = extractBetween(page, '<div class="model-table-wrap"', '<div class="footer">');
  const head = page.match(/running-head">([^<]+)</)?.[1];
  const title = page.match(/<h1 class="title">([^<]+)</)?.[1];
  pages.splice(
    i,
    1,
    mkPage({ runningHead: head, title, col1: sec3, col2: col2 }),
    mkPage({ runningHead: head, title: null, colsClass: 'dense2', colsStyle: 'margin-top:23mm;', col1: sec4, col2: '', extra: tableExtra })
  );
}

function replacePageByNeedle(pages, needle, newPages) {
  const i = findPageIndex(pages, needle);
  pages.splice(i, 1, ...newPages);
}

function main() {
  let html = fs.readFileSync(RU_FILE, 'utf8');
  if (!html.includes('html[lang="ru"] #manual-doc{font-size:7.85pt')) {
    html = html.replace('</style>', `${COMPACT_CSS}\n</style>`);
  }

  let pages = getPages(html);

  splitIntro(pages);
  splitDrumModels(pages);

  replacePageByNeedle(pages, '<h2>5. Поведение параметров Classic</h2>', splitColsAt(
    pages[findPageIndex(pages, '<h2>5. Поведение параметров Classic</h2>')],
    '<div class="section compact"><h3>Classic Expert</h3>'
  ));

  replacePageByNeedle(pages, '<h2>6. Модели Digital</h2>', splitColsAt(
    pages[findPageIndex(pages, '<h2>6. Модели Digital</h2>')],
    '<h2>7. Поведение параметров Digital</h2>'
  ));

  replacePageByNeedle(pages, '<h2>8. Модели Analog</h2>', splitColsAt(
    pages[findPageIndex(pages, '<h2>8. Модели Analog</h2>')],
    '<h2>9. Поведение параметров Analog</h2>'
  ));

  replacePageByNeedle(pages, '<h2>10. Модели Digital+</h2>', splitColsAt(
    pages[findPageIndex(pages, '<h2>10. Модели Digital+</h2>')],
    '<h2>11. Поведение параметров Digital+</h2>'
  ));

  replacePageByNeedle(pages, '<h2>11. Поведение параметров Digital+</h2>', splitColsAt(
    pages[findPageIndex(pages, '<h2>11. Поведение параметров Digital+</h2>')],
    '<div class="section compact"><h3>Голос хай-хэта Digital+</h3>'
  ));

  replacePageByNeedle(pages, '<h2>12. Модели томов и деревянной перкуссии</h2>', splitColsAt(
    pages[findPageIndex(pages, '<h2>12. Модели томов и деревянной перкуссии</h2>')],
    '<div class="section compact"><h3>Wood Conga/Tom</h3>'
  ));

  replacePageByNeedle(pages, '<h2>13. Металлические и акцентные модели</h2>', splitColsAt(
    pages[findPageIndex(pages, '<h2>13. Металлические и акцентные модели</h2>')],
    '<div class="section compact"><h3>Clap</h3>'
  ));

  replacePageByNeedle(pages, '<h2>14. Выбор модели</h2>', splitColsAt(
    pages[findPageIndex(pages, '<h2>14. Выбор модели</h2>')],
    '<div class="section compact"><h2>15. Модуляция</h2>'
  ));

  replacePageByNeedle(pages, '<div class="section compact"><h3>Cowbell</h3>', splitColsAt(
    pages[findPageIndex(pages, '<div class="section compact"><h3>Cowbell</h3>')],
    '<div class="section compact"><h3>Cowbell</h3>',
    { runningHead: 'Модуляция' }
  ));

  // Modulation detail page with Amount: split LFO to next page
  replacePageByNeedle(pages, '<h3>Amount</h3>', splitColsAt(
    pages[findPageIndex(pages, '<h3>Amount</h3>')],
    '<div class="section compact"><h3>LFO</h3>',
    { runningHead: 'Модуляция' }
  ));

  // Destination on col2: split examples to next page
  replacePageByNeedle(pages, '<h3>Destination</h3>', (() => {
    const page = pages[findPageIndex(pages, '<h3>Destination</h3>')];
    const p = parseCols(page);
    const ex = '<div class="section compact"><h3>Практические примеры';
    const di = p.col2.indexOf('<div class="section compact"><h3>Destination</h3>');
    const ei = p.col2.indexOf(ex);
    if (di === -1 || ei === -1) return [page];
    return [
      mkPage({ runningHead: 'Модуляция', title: null, colsClass: 'dense2', colsStyle: 'margin-top:23mm;', col1: p.col1, col2: p.col2.slice(0, di).trim() }),
      mkPage({ runningHead: 'Модуляция', title: null, colsClass: 'dense2', colsStyle: 'margin-top:23mm;', col1: p.col2.slice(di, ei).trim(), col2: p.col2.slice(ei).trim() }),
    ];
  })());

  replacePageByNeedle(pages, '<h2>16. Практическая работа с MartelloX2</h2>', splitColsAt(
    pages[findPageIndex(pages, '<h2>16. Практическая работа с MartelloX2</h2>')],
    '<h2>17. Краткое руководство по выбору</h2>'
  ));

  pages = renumberPages(pages);
  html = setPages(html, pages);
  fs.writeFileSync(RU_FILE, html, 'utf8');

  console.log('Total pages:', pages.filter((p) => !/folio-top">(ii|iii)</.test(p)).length);
  pages.forEach((p) => {
    const f = p.match(/folio-top">([^<]+)</)?.[1];
    const h = p.match(/running-head">([^<]+)</)?.[1];
    const h2 = p.match(/<h2>([^<]+)<\/h2>/)?.[1] || p.match(/<h3>([^<]+)<\/h3>/)?.[1] || '';
    if (f && f !== 'ii' && f !== 'iii') console.log(`  ${f}: ${h} — ${h2.slice(0, 45)}`);
  });
}

main();
