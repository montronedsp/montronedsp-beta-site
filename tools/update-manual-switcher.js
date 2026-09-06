import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const langs = [
  { file: 'martello-manual.html', label: 'English' },
  { file: 'martello-manual-it.html', label: 'Italiano' },
  { file: 'martello-manual-de.html', label: 'Deutsch' },
  { file: 'martello-manual-es.html', label: 'Español' },
  { file: 'martello-manual-fr.html', label: 'Français' },
  { file: 'martello-manual-ja.html', label: '日本語' },
  { file: 'martello-manual-zh-CN.html', label: '中文' },
  { file: 'martello-manual-ru.html', label: 'Русский' },
  { file: 'martello-manual-uk.html', label: 'Українська' },
];

const ui = {
  en: { aria: 'Manual language', label: 'Language' },
  it: { aria: 'Lingua del manuale', label: 'Lingua' },
  de: { aria: 'Handbuchsprache', label: 'Sprache' },
  es: { aria: 'Idioma del manual', label: 'Idioma' },
  fr: { aria: 'Langue du manuel', label: 'Langue' },
  ja: { aria: 'マニュアル言語', label: '言語' },
  'zh-CN': { aria: '手册语言', label: '语言' },
  ru: { aria: 'Язык руководства', label: 'Язык' },
  uk: { aria: 'Мова керівництва', label: 'Мова' },
};

const switcherCss = `  .manual-lang-switcher{
    position:fixed;top:16px;right:16px;z-index:1000;
    display:flex;align-items:stretch;
    background:#fff;border:1px solid #777;
    box-shadow:0 4px 18px rgba(0,0,0,.18);
    font-family:Arial,Helvetica,sans-serif;
    font-size:8pt;
    opacity:0;transform:translateY(-6px);
    transition:opacity .25s ease,transform .25s ease;
    pointer-events:none;
  }
  body.manual-loaded .manual-lang-switcher{
    opacity:1;transform:translateY(0);pointer-events:auto;
  }
  .manual-lang-switcher .manual-lang-label{
    display:flex;align-items:center;padding:7px 10px;font-weight:800;color:#666;
    border-right:1px solid #d6d6d6;background:#f7f7f7;
    letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;
  }
  .manual-lang-switcher .manual-lang-select{
    border:0;background:#fff;padding:0 28px 0 10px;min-width:124px;max-width:160px;
    font-family:Arial,Helvetica,sans-serif;font-size:8pt;font-weight:700;
    color:#222;cursor:pointer;appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 8 5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%23333'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:right 10px center;
  }
  .manual-lang-switcher .manual-lang-select:focus{outline:2px solid #111;outline-offset:-2px;}
  .manual-lang-switcher .manual-lang-pdf{
    display:flex;align-items:center;padding:7px 11px;color:#222;text-decoration:none;font-weight:700;
    border-left:1px solid #d6d6d6;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;
  }
  .manual-lang-switcher .manual-lang-pdf:hover{background:#f0f0f0;}
  @media print{.manual-lang-switcher{display:none!important;}}`;

const scriptBlock = `<script>document.addEventListener('DOMContentLoaded',function(){document.body.classList.add('manual-loaded');var s=document.querySelector('.manual-lang-select');if(s)s.addEventListener('change',function(){if(this.value)window.location.href=this.value;});});</script>`;

function langCode(file) {
  if (file === 'martello-manual.html') return 'en';
  const m = file.match(/martello-manual-(.+)\.html$/);
  return m ? m[1] : 'en';
}

function buildNav(currentFile, code) {
  const meta = ui[code] || ui.en;
  const options = langs
    .map(
      (l) =>
        `<option value="${l.file}"${l.file === currentFile ? ' selected' : ''}>${l.label}</option>`
    )
    .join('');
  return `<nav class="manual-lang-switcher" aria-label="${meta.aria}">
  <span class="manual-lang-label">${meta.label}</span>
  <select class="manual-lang-select" aria-label="${meta.aria}">
    ${options}
  </select>
  <a class="manual-lang-pdf" href="assets/downloads/Martello_User_Manual_v1.1.2.pdf" download="Martello_User_Manual_v1.1.2.pdf">PDF</a>
</nav>`;
}

for (const { file } of langs) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    console.warn('skip missing', file);
    continue;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  const code = langCode(file);

  html = html.replace(/\s*\.manual-lang-switcher[\s\S]*?@media print\{\.manual-lang-switcher\{display:none!important;\}\}\s*/g, '\n');
  html = html.replace(/\s*\.manual-lang-switcher\{white-space:nowrap;\}\s*/g, '\n');

  if (!html.includes('</style>')) continue;
  html = html.replace('</style>', `${switcherCss}\n\n</style>`);

  html = html.replace(/<nav[^>]*class="manual-lang-switcher"[\s\S]*?<\/nav>\s*/i, '');
  html = html.replace(/<body>\s*/i, `<body>\n${buildNav(file, code)}\n`);

  html = html.replace(
    /<script>document\.addEventListener\('DOMContentLoaded'[\s\S]*?<\/script>\s*(<\/body>)/,
    `${scriptBlock}\n$1`
  );
  if (!html.includes('manual-lang-select')) {
    html = html.replace('</body>', `${scriptBlock}\n</body>`);
  }

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('updated', file);
}
