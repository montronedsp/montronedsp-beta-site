const path = require('path');
const { chromium } = require('playwright');

const file = process.argv[2] || 'martello-manual-ru.html';
const fileUrl = 'file:///' + path.resolve(__dirname, '..', file).replace(/\\/g, '/');
const FOOTER_Y = 1047; // px — content should stay above this line

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 900, height: 1200 });
  await page.goto(fileUrl, { waitUntil: 'load' });

  const results = await page.evaluate((footerY) => {
    const pages = [...document.querySelectorAll('#manual-doc .page, #manual-doc > .page, section.page')];
    const allPages = pages.length
      ? pages
      : [...document.querySelectorAll('section.page')];

    return allPages.map((pg) => {
      const folio = pg.querySelector('.folio-top')?.textContent?.trim() || '?';
      const pageRect = pg.getBoundingClientRect();
      const footer = pg.querySelector('.footer');
      const footerTop = footer ? footer.getBoundingClientRect().top - pageRect.top : footerY;

      const bleeders = [];
      const check = (el) => {
        if (!el || el === footer || footer?.contains(el)) return;
        const r = el.getBoundingClientRect();
        const bottom = r.bottom - pageRect.top;
        if (bottom > footerTop - 2) {
          const tag = el.tagName.toLowerCase();
          const cls = el.className ? `.${String(el.className).split(/\s+/)[0]}` : '';
          const text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 70);
          bleeders.push({ bottom: Math.round(bottom), tag: tag + cls, text });
        }
      };

      pg.querySelectorAll('.col, .col > *, .title, .rule, h1, .cols > *').forEach((el) => {
        check(el);
        el.querySelectorAll('h2, h3, p, ul, table, .keyboard-wrap, .module-diagram, .section').forEach(check);
      });

      // dedupe by text
      const seen = new Set();
      const unique = bleeders.filter((b) => {
        const k = b.text;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      const maxBottom = unique.length ? Math.max(...unique.map((b) => b.bottom)) : 0;
      return { folio, footerTop: Math.round(footerTop), maxBottom, bleeders: unique.slice(0, 6) };
    });
  }, FOOTER_Y);

  const bleeding = results.filter((r) => r.maxBottom > r.footerTop - 2);

  console.log('File:', file);
  console.log('Pages checked:', results.length);
  console.log('Footer threshold ~', FOOTER_Y, 'px\n');

  for (const r of results) {
    const status = r.maxBottom > r.footerTop - 2 ? 'BLEED' : 'ok';
    console.log(`Page ${r.folio}: ${status} (max=${r.maxBottom}px, footer=${r.footerTop}px)`);
    if (r.bleeders.length && r.maxBottom > r.footerTop - 2) {
      r.bleeders.forEach((b) => console.log(`  - ${b.bottom}px ${b.tag}: ${b.text}`));
    }
  }

  console.log('\nBleeding pages:', bleeding.map((r) => r.folio).join(', ') || 'none');
  await browser.close();
  process.exit(bleeding.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
