import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const codes = ['en', 'it', 'de', 'es', 'fr', 'ja', 'zh-CN', 'ru', 'uk'];

function normalizeText(text) {
  return text
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .replace(/\u00A0/g, ' ');
}

for (const code of codes) {
  const file = path.join(root, 'locales', `${code}.json`);
  const raw = fs.readFileSync(file);
  // Reject files that aren't valid UTF-8
  const text = new TextDecoder('utf-8', { fatal: true }).decode(raw);
  const obj = JSON.parse(normalizeText(text));

  if (code === 'it') {
    obj.nav.store = 'Negozio';
    obj.footer.store = 'Negozio';
    obj.home.martello.introTitle = 'Nato per il groove.';
  }

  const out = `${JSON.stringify(obj, null, 2)}\n`;
  fs.writeFileSync(file, out, 'utf8');

  // Round-trip check for Latin accents
  const again = JSON.parse(fs.readFileSync(file, 'utf8'));
  const sample = JSON.stringify(again).match(/[àèéìòùÀÈÉÌÒÙñÑçÇäöüß]/g) || [];
  console.log(
    code,
    'ok',
    'accents=',
    sample.length,
    code === 'it' ? `footer=${again.footer.copy} title=${again.home.martello.introTitle}` : ''
  );
}
