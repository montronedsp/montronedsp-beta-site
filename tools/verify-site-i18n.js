import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function leaves(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) keys = keys.concat(leaves(v, p));
    else keys.push(p);
  }
  return keys.sort();
}

const en = JSON.parse(fs.readFileSync(path.join(root, 'locales', 'en.json'), 'utf8'));
const ns = ['common', 'about', 'contact', 'free', 'dawless', 'demo', 'privacy', 'modi'];
const enPage = {};
for (const k of ns) enPage[k] = en[k];
const enKeys = leaves(enPage);

const codes = ['it', 'de', 'es', 'fr', 'ja', 'zh-CN', 'ru', 'uk'];
let ok = true;
for (const code of codes) {
  const loc = JSON.parse(fs.readFileSync(path.join(root, 'locales', `${code}.json`), 'utf8'));
  const page = {};
  for (const k of ns) page[k] = loc[k];
  const keys = leaves(page);
  const miss = enKeys.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !enKeys.includes(k));
  console.log(code, 'pageKeys', keys.length, 'miss', miss.length, 'extra', extra.length);
  if (miss.length || extra.length) {
    ok = false;
    console.log(' miss sample', miss.slice(0, 5));
    console.log(' extra sample', extra.slice(0, 5));
  }
  console.log(' ', code, 'contact.title=', loc.contact?.title, '| demo.buyFull=', loc.demo?.buyFull);
}

const pages = [
  'about.html',
  'contact.html',
  'free.html',
  'dawless.html',
  'privacy.html',
  'modi.html',
  'index.html'
];
for (const file of pages) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const hasI18n = html.includes('src="i18n.js"');
  const hasSelect = html.includes('site-lang-select');
  const page = (html.match(/data-i18n-page="([^"]+)"/) || [])[1] || '(home)';
  const count = (html.match(/data-i18n=/g) || []).length;
  console.log(file, { page, hasI18n, hasSelect, dataI18n: count });
  if (file !== 'index.html' && (!hasI18n || !hasSelect)) ok = false;
}

// privacy h7 list check
const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');
if (!privacy.includes('data-i18n="privacy.h7li5"')) {
  console.log('WARN: privacy.h7li5 missing');
  ok = false;
}

process.exit(ok ? 0 : 1);
