import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function patchFile(rel, reps) {
  const file = path.join(root, rel);
  let html = fs.readFileSync(file, 'utf8');
  const nl = html.includes('\r\n') ? '\r\n' : '\n';
  const norm = (s) => s.replace(/\r\n|\n/g, nl);
  let missing = 0;
  for (const [fromRaw, toRaw] of reps) {
    const from = norm(fromRaw);
    const to = norm(toRaw);
    if (!html.includes(from)) {
      console.error(`[${rel}] MISSING: ${fromRaw.slice(0, 100).replace(/\n/g, '\\n')}`);
      missing++;
      continue;
    }
    html = html.replace(from, to);
  }
  if (missing) {
    throw new Error(`${rel}: ${missing} missing replacements`);
  }
  fs.writeFileSync(file, html, 'utf8');
  console.log('patched', rel, reps.length);
}

const chromeNav = (current) => {
  const demoCur = current === 'demo' ? ' aria-current="page"' : '';
  const freeCur = current === 'free' ? ' aria-current="page"' : '';
  return `<nav class="site-nav" aria-label="Main navigation" data-i18n-aria="nav.mainAria">
          <a class="nav-link" href="martello-demo.html"${demoCur} data-i18n="nav.demo">Demo</a>
          <a class="nav-link" href="https://store.montronedsp.com/" target="_blank" rel="noopener noreferrer" data-i18n="nav.store">Store</a>
          <a class="nav-link" href="free.html"${freeCur} data-i18n="nav.free">Free</a>
          <label class="site-lang">
            <span class="sr-only" data-i18n="lang.label">Language</span>
            <select class="site-lang-select" aria-label="Language" data-i18n-aria="lang.aria"></select>
          </label>
        </nav>`;
};

const chromeHeaderBits = [
  [
    'aria-label="MontroneDSP home"',
    'aria-label="MontroneDSP home" data-i18n-aria="nav.homeAria"'
  ],
  [
    'aria-label="Choose product"',
    'aria-label="Choose product" data-i18n-aria="products.chooseAria"'
  ],
  [
    '<span class="product-tab-type">Drum Synthesizer</span>',
    '<span class="product-tab-type" data-i18n="products.martello.type">Drum Synthesizer</span>'
  ],
  [
    '<span class="product-tab-type">Environmental Processor</span>',
    '<span class="product-tab-type" data-i18n="products.galleria.type">Environmental Processor</span>'
  ],
  [
    '<span class="product-tab-type">Physical Synthesizer</span>',
    '<span class="product-tab-type" data-i18n="products.membrana.type">Physical Synthesizer</span>'
  ]
];

const chromeFooter = (privacyCurrent = false) => [
  [
    `<p class="footer-copy">© <span id="year"></span> MontroneDSP. MontroneDSP is a registered trademark.</p>
        <nav class="footer-nav" aria-label="Footer navigation">
          <a href="https://store.montronedsp.com/" target="_blank" rel="noopener noreferrer">Store</a>
          <a href="dawless.html">DAWLESS</a>
          <a href="contact.html">Contact</a>
          <a href="free.html">Free</a>
          <a href="privacy.html"${privacyCurrent ? ' aria-current="page"' : ''}>Privacy</a>
        </nav>`,
    `<p class="footer-copy" data-i18n="footer.copy">© {year} MontroneDSP. MontroneDSP is a registered trademark.</p>
        <nav class="footer-nav" aria-label="Footer navigation" data-i18n-aria="footer.navAria">
          <a href="https://store.montronedsp.com/" target="_blank" rel="noopener noreferrer" data-i18n="footer.store">Store</a>
          <a href="dawless.html" data-i18n="footer.dawless">DAWLESS</a>
          <a href="contact.html" data-i18n="footer.contact">Contact</a>
          <a href="free.html" data-i18n="footer.free">Free</a>
          <a href="privacy.html"${privacyCurrent ? ' aria-current="page"' : ''} data-i18n="footer.privacy">Privacy</a>
        </nav>`
  ]
];

const chromeSocial = [
  [
    `<h2 id="social-title" class="social-title">Follow us on social</h2>
        <nav class="social-nav" aria-label="Social media">`,
    `<h2 id="social-title" class="social-title" data-i18n="social.title">Follow us on social</h2>
        <nav class="social-nav" aria-label="Social media" data-i18n-aria="social.navAria">`
  ]
];

const addI18nScript = [
  ['<script src="script.js"></script>', '<script src="i18n.js"></script>\n  <script src="script.js"></script>']
];

function setPageAttr(htmlPage, page) {
  return [
    [/<html([^>]*) lang="en"/, `<html$1 lang="en" data-i18n-page="${page}"`]
  ].map(([re, to]) => {
    // handled specially
    return null;
  });
}

function ensurePageAttr(rel, page) {
  const file = path.join(root, rel);
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes(`data-i18n-page="${page}"`)) return;
  if (!html.includes('lang="en"')) throw new Error(`${rel}: no lang=en`);
  html = html.replace('lang="en"', `lang="en" data-i18n-page="${page}"`);
  fs.writeFileSync(file, html, 'utf8');
}

function navFrom(current) {
  const demoCur = current === 'demo' ? ' aria-current="page"' : '';
  const freeCur = current === 'free' ? ' aria-current="page"' : '';
  const fromDemo = current === 'demo' ? ' aria-current="page"' : '';
  const fromFree = current === 'free' ? ' aria-current="page"' : '';
  return [
    [
      `<nav class="site-nav" aria-label="Main navigation">
          <a class="nav-link" href="martello-demo.html"${fromDemo}>Demo</a>
          <a class="nav-link" href="https://store.montronedsp.com/" target="_blank" rel="noopener noreferrer">Store</a>
          <a class="nav-link" href="free.html"${fromFree}>Free</a>
        </nav>`,
      chromeNav(current)
    ]
  ];
}

// CONTACT
ensurePageAttr('contact.html', 'contact');
patchFile('contact.html', [
  ...chromeHeaderBits,
  ...navFrom(null),
  ...chromeSocial,
  ...chromeFooter(false),
  ...addI18nScript,
  ['<h1>Contact</h1>', '<h1 data-i18n="contact.title">Contact</h1>'],
  [
    '<p class="hero-copy">Questions about Martello, licensing, installation, or your order? Email us and we will get back to you.</p>',
    '<p class="hero-copy" data-i18n="contact.lead">Questions about Martello, licensing, installation, or your order? Email us and we will get back to you.</p>'
  ],
  ['<h2>Support</h2>', '<h2 data-i18n="contact.supportTitle">Support</h2>'],
  [
    '<p>For product support, activation help, and general inquiries:</p>',
    '<p data-i18n="contact.supportIntro">For product support, activation help, and general inquiries:</p>'
  ],
  ['<h2>What to include</h2>', '<h2 data-i18n="contact.includeTitle">What to include</h2>'],
  [
    '<p>Please include your platform (Windows or Linux), DAW name, plugin version if known, and a short description of the issue or question. For license activation problems, include the email address used at checkout.</p>',
    '<p data-i18n="contact.includeBody">Please include your platform (Windows or Linux), DAW name, plugin version if known, and a short description of the issue or question. For license activation problems, include the email address used at checkout.</p>'
  ],
  ['<h2>Response time</h2>', '<h2 data-i18n="contact.responseTitle">Response time</h2>'],
  [
    '<p>We aim to reply within a few business days. Complex technical issues may take longer while we investigate.</p>',
    '<p data-i18n="contact.responseBody">We aim to reply within a few business days. Complex technical issues may take longer while we investigate.</p>'
  ]
]);

// FREE
ensurePageAttr('free.html', 'free');
patchFile('free.html', [
  ...chromeHeaderBits,
  ...navFrom('free'),
  ...chromeSocial,
  ...chromeFooter(false),
  ...addI18nScript,
  [
    '<p class="story-index"><span>Free</span><span>Tools</span></p>\n            <h1 id="free-tools-title">Simple free utilities for audio work.</h1>\n            <p class="hero-lead">A small set of practical tools designed to fit into everyday production and mastering workflows.</p>',
    '<p class="story-index"><span data-i18n="free.eyebrowFree">Free</span><span data-i18n="free.eyebrowTools">Tools</span></p>\n            <h1 id="free-tools-title" data-i18n="free.title">Simple free utilities for audio work.</h1>\n            <p class="hero-lead" data-i18n="free.lead">A small set of practical tools designed to fit into everyday production and mastering workflows.</p>'
  ],
  [
    '<section class="container free-tools-section" aria-label="Free tools">',
    '<section class="container free-tools-section" aria-label="Free tools" data-i18n-aria="free.sectionAria">'
  ],
  [
    '<p class="tool-block-lockup-name">Batch Sample Rate Converter</p>',
    '<p class="tool-block-lockup-name" data-i18n="free.toolName">Batch Sample Rate Converter</p>'
  ],
  [
    '<p>Convert whole folders of audio files to a chosen sample rate, export MP3 versions, and keep the process straightforward for production, archive, and delivery work.</p>\n            <ul class="detail-list">\n              <li>Batch conversion for folders of files</li>\n              <li>Sample-rate conversion with consistent output</li>\n              <li>MP3 encoding for sharing and delivery</li>\n              <li>Simple workflow for everyday audio tasks</li>\n            </ul>',
    '<p data-i18n="free.toolBody">Convert whole folders of audio files to a chosen sample rate, export MP3 versions, and keep the process straightforward for production, archive, and delivery work.</p>\n            <ul class="detail-list">\n              <li data-i18n="free.toolLi1">Batch conversion for folders of files</li>\n              <li data-i18n="free.toolLi2">Sample-rate conversion with consistent output</li>\n              <li data-i18n="free.toolLi3">MP3 encoding for sharing and delivery</li>\n              <li data-i18n="free.toolLi4">Simple workflow for everyday audio tasks</li>\n            </ul>'
  ],
  [
    '<a class="btn btn-secondary" href="contact.html">Request access</a>',
    '<a class="btn btn-secondary" href="contact.html" data-i18n="free.requestAccess">Request access</a>'
  ],
  [
    '<h2>Share ideas and requests</h2>\n            <p>If you have a small audio utility you would like to see here, reach out and we can shape the next release around it.</p>',
    '<h2 data-i18n="free.ideasTitle">Share ideas and requests</h2>\n            <p data-i18n="free.ideasBody">If you have a small audio utility you would like to see here, reach out and we can shape the next release around it.</p>'
  ],
  [
    '<a class="btn btn-primary" href="contact.html">Contact us</a>',
    '<a class="btn btn-primary" href="contact.html" data-i18n="common.contactUs">Contact us</a>'
  ]
]);

// DAWLESS
ensurePageAttr('dawless.html', 'dawless');
patchFile('dawless.html', [
  ...chromeHeaderBits,
  ...navFrom(null),
  ...chromeFooter(false),
  ...addI18nScript,
  [
    '<p class="hero-copy">A focused native environment for MontroneDSP instruments and DSP.</p>\n          <div class="meta-row" aria-label="Project status">\n            <span>Experimental project</span>\n            <span>Early customers</span>\n            <span>In development</span>\n          </div>\n          <div class="hero-actions compact-actions">\n            <a class="btn btn-primary" href="contact.html">Get notified</a>\n            <a class="btn btn-secondary" href="./">Back to Home</a>\n          </div>',
    '<p class="hero-copy" data-i18n="dawless.lead">A focused native environment for MontroneDSP instruments and DSP.</p>\n          <div class="meta-row" aria-label="Project status" data-i18n-aria="dawless.statusAria">\n            <span data-i18n="dawless.statusExperimental">Experimental project</span>\n            <span data-i18n="dawless.statusEarly">Early customers</span>\n            <span data-i18n="dawless.statusDev">In development</span>\n          </div>\n          <div class="hero-actions compact-actions">\n            <a class="btn btn-primary" href="contact.html" data-i18n="common.getNotified">Get notified</a>\n            <a class="btn btn-secondary" href="./" data-i18n="common.backHome">Back to Home</a>\n          </div>'
  ],
  ['<h2 id="dawless-concept">The concept</h2>', '<h2 id="dawless-concept" data-i18n="dawless.conceptTitle">The concept</h2>'],
  [
    '<p class="detail-copy">DAWLESS is an experimental MontroneDSP project created for our first customers. It gives direct access to our handwritten DSP engines and instruments inside a native environment  -  without needing to open a traditional DAW.</p>\n          <p class="detail-copy">The aim is a simplified, optimized creative workstation: fewer distractions, fewer infinite choices, and a more defined workflow for music production and recording.</p>\n          <p class="detail-copy">DAWLESS is not meant to replace every DAW. It is a focused creative environment where you can start, compose, sequence, record, and shape ideas with less friction  -  then move the work forward when the time is right.</p>',
    '<p class="detail-copy" data-i18n="dawless.conceptP1">DAWLESS is an experimental MontroneDSP project created for our first customers. It gives direct access to our handwritten DSP engines and instruments inside a native environment  -  without needing to open a traditional DAW.</p>\n          <p class="detail-copy" data-i18n="dawless.conceptP2">The aim is a simplified, optimized creative workstation: fewer distractions, fewer infinite choices, and a more defined workflow for music production and recording.</p>\n          <p class="detail-copy" data-i18n="dawless.conceptP3">DAWLESS is not meant to replace every DAW. It is a focused creative environment where you can start, compose, sequence, record, and shape ideas with less friction  -  then move the work forward when the time is right.</p>'
  ],
  [
    '<h2 id="dawless-workflow">Less options, more music</h2>\n          <p class="detail-copy">Most production environments offer everything at once. DAWLESS takes the opposite approach: a defined path through the work, with the tools that matter already in place.</p>\n          <ul class="detail-list">\n            <li>No infinite menus</li>\n            <li>No endless plugin searching</li>\n            <li>No generic DAW clutter</li>\n            <li>A clear workflow for creating, sequencing, recording, and shaping sound</li>\n          </ul>\n          <p class="detail-copy">The goal is to combine the immediacy and focus of a hardware-like DAWless workflow with the sound quality and depth of MontroneDSP native instruments and DSP  -  and the convenience of exporting your work into a traditional professional production pipeline when you are ready.</p>',
    '<h2 id="dawless-workflow" data-i18n="dawless.workflowTitle">Less options, more music</h2>\n          <p class="detail-copy" data-i18n="dawless.workflowIntro">Most production environments offer everything at once. DAWLESS takes the opposite approach: a defined path through the work, with the tools that matter already in place.</p>\n          <ul class="detail-list">\n            <li data-i18n="dawless.workflowLi1">No infinite menus</li>\n            <li data-i18n="dawless.workflowLi2">No endless plugin searching</li>\n            <li data-i18n="dawless.workflowLi3">No generic DAW clutter</li>\n            <li data-i18n="dawless.workflowLi4">A clear workflow for creating, sequencing, recording, and shaping sound</li>\n          </ul>\n          <p class="detail-copy" data-i18n="dawless.workflowOutro">The goal is to combine the immediacy and focus of a hardware-like DAWless workflow with the sound quality and depth of MontroneDSP native instruments and DSP  -  and the convenience of exporting your work into a traditional professional production pipeline when you are ready.</p>'
  ],
  [
    '<h2 id="dawless-native">Native MontroneDSP</h2>\n          <p class="detail-copy">DAWLESS is built around our own instruments and DSP  -  written specifically for the MontroneDSP ecosystem, not adapted from a generic host.</p>\n          <p class="detail-copy">The sound engines are handwritten: processors and instruments developed in-house for this environment, without relying on a third-party host or off-the-shelf framework.</p>\n          <p class="detail-copy">The environment is the engine. Sound design, synthesis, processing, and sequencing run on the same native foundation that powers our plugins  -  integrated from the start, not loaded in afterward.</p>',
    '<h2 id="dawless-native" data-i18n="dawless.nativeTitle">Native MontroneDSP</h2>\n          <p class="detail-copy" data-i18n="dawless.nativeP1">DAWLESS is built around our own instruments and DSP  -  written specifically for the MontroneDSP ecosystem, not adapted from a generic host.</p>\n          <p class="detail-copy" data-i18n="dawless.nativeP2">The sound engines are handwritten: processors and instruments developed in-house for this environment, without relying on a third-party host or off-the-shelf framework.</p>\n          <p class="detail-copy" data-i18n="dawless.nativeP3">The environment is the engine. Sound design, synthesis, processing, and sequencing run on the same native foundation that powers our plugins  -  integrated from the start, not loaded in afterward.</p>'
  ],
  [
    '<h2 id="dawless-export">Export when you are ready</h2>\n          <p class="detail-copy">You will not be locked inside DAWLESS. When a project needs to continue in a traditional DAW  -  or be handed to a mixing or mastering engineer  -  the environment will include session exporters targeting the most widely used DAWs.</p>\n          <p class="detail-copy">The transition from a focused DAWLESS session into a full professional mix and master workflow is meant to be direct and painless. Start here. Finish wherever your process requires.</p>',
    '<h2 id="dawless-export" data-i18n="dawless.exportTitle">Export when you are ready</h2>\n          <p class="detail-copy" data-i18n="dawless.exportP1">You will not be locked inside DAWLESS. When a project needs to continue in a traditional DAW  -  or be handed to a mixing or mastering engineer  -  the environment will include session exporters targeting the most widely used DAWs.</p>\n          <p class="detail-copy" data-i18n="dawless.exportP2">The transition from a focused DAWLESS session into a full professional mix and master workflow is meant to be direct and painless. Start here. Finish wherever your process requires.</p>'
  ]
]);

// DEMO
ensurePageAttr('martello-demo.html', 'demo');
patchFile('martello-demo.html', [
  ...chromeHeaderBits,
  ...navFrom('demo'),
  ...chromeFooter(false),
  ...addI18nScript,
  ['<h1>Martello Demo</h1>', '<h1 data-i18n="demo.title">Martello Demo</h1>'],
  [
    '<p class="hero-copy">Download the 7-day Martello trial for macOS, Windows, and Linux. Read the details below before installing.</p>',
    '<p class="hero-copy" data-i18n="demo.lead">Download the 7-day Martello trial for macOS, Windows, and Linux. Read the details below before installing.</p>'
  ],
  [
    '<h2 id="martello-demo-about">About the demo</h2>\n          <p class="detail-copy">The macOS, Windows, and Linux trials let you test Martello and MartelloX2 in your DAW: synthetic drum voices, MIDI response, plugin stability, and the punchy machine character of the full release.</p>\n          <ul class="detail-list">\n            <li>7-day trial period</li>\n            <li>macOS, Windows, and Linux trials available now</li>\n            <li>test in your DAW</li>\n            <li>synthetic drum voices</li>\n            <li>MIDI response and plugin stability</li>\n            <li>upgrade to the full version anytime on the store</li>\n          </ul>',
    '<h2 id="martello-demo-about" data-i18n="demo.aboutTitle">About the demo</h2>\n          <p class="detail-copy" data-i18n="demo.aboutBody">The macOS, Windows, and Linux trials let you test Martello and MartelloX2 in your DAW: synthetic drum voices, MIDI response, plugin stability, and the punchy machine character of the full release.</p>\n          <ul class="detail-list">\n            <li data-i18n="demo.aboutLi1">7-day trial period</li>\n            <li data-i18n="demo.aboutLi2">macOS, Windows, and Linux trials available now</li>\n            <li data-i18n="demo.aboutLi3">test in your DAW</li>\n            <li data-i18n="demo.aboutLi4">synthetic drum voices</li>\n            <li data-i18n="demo.aboutLi5">MIDI response and plugin stability</li>\n            <li data-i18n="demo.aboutLi6">upgrade to the full version anytime on the store</li>\n          </ul>'
  ],
  [
    '<h2 id="martello-demo-downloads">Downloads</h2>\n          <p class="detail-copy">Martello trial packages for macOS, Windows, and Linux. Download the manual below or use the platform-specific trial links. Installing or using the Software requires acceptance of the <a href="#martello-eula">End User License Agreement</a> below.</p>',
    '<h2 id="martello-demo-downloads" data-i18n="demo.downloadsTitle">Downloads</h2>\n          <p class="detail-copy" data-i18n="demo.downloadsIntro" data-i18n-html>Martello trial packages for macOS, Windows, and Linux. Download the manual below or use the platform-specific trial links. Installing or using the Software requires acceptance of the <a href="#martello-eula">End User License Agreement</a> below.</p>'
  ],
  [
    '<h3 class="detail-name">macOS VST3/AU</h3>\n              <p class="detail-label">Available</p>\n              <p class="detail-copy">7-day trial bundle for macOS VST3/AU hosts. Martello and MartelloX2 included. Installer .pkg and manual install archive are included in the package.</p>\n              <ol class="detail-list">\n                <li>Close your DAW.</li>\n                <li>Download the ZIP and extract it.</li>\n                <li>Double-click the installer package included in the bundle and follow the installer, or use the manual install archive included in the bundle for manual installation.</li>\n                <li>Open your DAW and rescan plug-ins if needed. The plugins appear under MontroneDSP.</li>\n              </ol>\n              <div class="demo-download-actions">\n                <a class="btn btn-primary" href="assets/downloads/Martello_Bundle_v1.1.2_Trial_Mac.zip" download="Martello_Bundle_v1.1.2_Trial_Mac.zip">Download macOS v1.1.2 Trial</a>\n                <a class="btn btn-secondary" href="assets/downloads/Martello_User_Manual_v1.1.2.pdf" download="Martello_User_Manual_v1.1.2.pdf">Download Manual PDF</a>\n              </div>',
    '<h3 class="detail-name" data-i18n="demo.macTitle">macOS VST3/AU</h3>\n              <p class="detail-label" data-i18n="common.available">Available</p>\n              <p class="detail-copy" data-i18n="demo.macBody">7-day trial bundle for macOS VST3/AU hosts. Martello and MartelloX2 included. Installer .pkg and manual install archive are included in the package.</p>\n              <ol class="detail-list">\n                <li data-i18n="demo.macStep1">Close your DAW.</li>\n                <li data-i18n="demo.macStep2">Download the ZIP and extract it.</li>\n                <li data-i18n="demo.macStep3">Double-click the installer package included in the bundle and follow the installer, or use the manual install archive included in the bundle for manual installation.</li>\n                <li data-i18n="demo.macStep4">Open your DAW and rescan plug-ins if needed. The plugins appear under MontroneDSP.</li>\n              </ol>\n              <div class="demo-download-actions">\n                <a class="btn btn-primary" href="assets/downloads/Martello_Bundle_v1.1.2_Trial_Mac.zip" download="Martello_Bundle_v1.1.2_Trial_Mac.zip" data-i18n="demo.macDownload">Download macOS v1.1.2 Trial</a>\n                <a class="btn btn-secondary" href="assets/downloads/Martello_User_Manual_v1.1.2.pdf" download="Martello_User_Manual_v1.1.2.pdf" data-i18n="demo.manualPdf">Download Manual PDF</a>\n              </div>'
  ],
  [
    '<h3 class="detail-name">Windows VST3</h3>\n              <p class="detail-label">Available</p>\n              <p class="detail-copy">7-day trial packages for Windows VST3 hosts. Manual installation:</p>\n              <ol class="detail-list">\n                <li>Close your DAW.</li>\n                <li>Download the ZIP and extract it.</li>\n                <li>Copy <strong>Martello.vst3</strong> or <strong>MartelloX2.vst3</strong> from the <strong>VST3</strong> folder in the package.</li>\n                <li>Paste the plugin folder into <strong>C:\\Program Files\\Common Files\\VST3\\</strong></li>\n                <li>Open your DAW and rescan plug-ins if needed. The plugin appears under MontroneDSP.</li>\n              </ol>\n              <div class="demo-download-actions">\n                <a class="btn btn-primary" href="assets/downloads/Martello_Bundle_v1.1.2_Trial_Windows_x64.zip" download="Martello_Bundle_v1.1.2_Trial_Windows_x64.zip">Download Windows v1.1.2 Trial</a>\n                <a class="btn btn-secondary" href="assets/downloads/Martello_User_Manual_v1.1.2.pdf" download="Martello_User_Manual_v1.1.2.pdf">Download Manual PDF</a>\n              </div>',
    '<h3 class="detail-name" data-i18n="demo.winTitle">Windows VST3</h3>\n              <p class="detail-label" data-i18n="common.available">Available</p>\n              <p class="detail-copy" data-i18n="demo.winBody">7-day trial packages for Windows VST3 hosts. Manual installation:</p>\n              <ol class="detail-list">\n                <li data-i18n="demo.winStep1">Close your DAW.</li>\n                <li data-i18n="demo.winStep2">Download the ZIP and extract it.</li>\n                <li data-i18n="demo.winStep3" data-i18n-html>Copy <strong>Martello.vst3</strong> or <strong>MartelloX2.vst3</strong> from the <strong>VST3</strong> folder in the package.</li>\n                <li data-i18n="demo.winStep4" data-i18n-html>Paste the plugin folder into <strong>C:\\Program Files\\Common Files\\VST3\\</strong></li>\n                <li data-i18n="demo.winStep5">Open your DAW and rescan plug-ins if needed. The plugin appears under MontroneDSP.</li>\n              </ol>\n              <div class="demo-download-actions">\n                <a class="btn btn-primary" href="assets/downloads/Martello_Bundle_v1.1.2_Trial_Windows_x64.zip" download="Martello_Bundle_v1.1.2_Trial_Windows_x64.zip" data-i18n="demo.winDownload">Download Windows v1.1.2 Trial</a>\n                <a class="btn btn-secondary" href="assets/downloads/Martello_User_Manual_v1.1.2.pdf" download="Martello_User_Manual_v1.1.2.pdf" data-i18n="demo.manualPdf">Download Manual PDF</a>\n              </div>'
  ],
  [
    '<h3 class="detail-name">Linux VST3</h3>\n              <p class="detail-label">Available</p>\n              <p class="detail-copy">7-day trial bundle for Linux VST3 hosts. Martello and MartelloX2 included. Manual installation:</p>\n              <ol class="detail-list">\n                <li>Close your DAW.</li>\n                <li>Download the ZIP and extract it.</li>\n                <li>Copy <strong>Martello.vst3</strong> and <strong>MartelloX2.vst3</strong> from the <strong>VST3</strong> folder in the package.</li>\n                <li>Paste the plugin folders into <strong>~/.vst3/</strong></li>\n                <li>Open your DAW and rescan plug-ins if needed. The plugins appear under MontroneDSP.</li>\n              </ol>\n              <div class="demo-download-actions">\n                <a class="btn btn-primary" href="assets/downloads/Martello_Bundle_v1.1.2_Trial_Linux_x64.zip" download="Martello_Bundle_v1.1.2_Trial_Linux_x64.zip">Download Linux v1.1.2 Trial</a>\n                <a class="btn btn-secondary" href="assets/downloads/Martello_User_Manual_v1.1.2.pdf" download="Martello_User_Manual_v1.1.2.pdf">Download Manual PDF</a>\n              </div>',
    '<h3 class="detail-name" data-i18n="demo.linuxTitle">Linux VST3</h3>\n              <p class="detail-label" data-i18n="common.available">Available</p>\n              <p class="detail-copy" data-i18n="demo.linuxBody">7-day trial bundle for Linux VST3 hosts. Martello and MartelloX2 included. Manual installation:</p>\n              <ol class="detail-list">\n                <li data-i18n="demo.linuxStep1">Close your DAW.</li>\n                <li data-i18n="demo.linuxStep2">Download the ZIP and extract it.</li>\n                <li data-i18n="demo.linuxStep3" data-i18n-html>Copy <strong>Martello.vst3</strong> and <strong>MartelloX2.vst3</strong> from the <strong>VST3</strong> folder in the package.</li>\n                <li data-i18n="demo.linuxStep4" data-i18n-html>Paste the plugin folders into <strong>~/.vst3/</strong></li>\n                <li data-i18n="demo.linuxStep5">Open your DAW and rescan plug-ins if needed. The plugins appear under MontroneDSP.</li>\n              </ol>\n              <div class="demo-download-actions">\n                <a class="btn btn-primary" href="assets/downloads/Martello_Bundle_v1.1.2_Trial_Linux_x64.zip" download="Martello_Bundle_v1.1.2_Trial_Linux_x64.zip" data-i18n="demo.linuxDownload">Download Linux v1.1.2 Trial</a>\n                <a class="btn btn-secondary" href="assets/downloads/Martello_User_Manual_v1.1.2.pdf" download="Martello_User_Manual_v1.1.2.pdf" data-i18n="demo.manualPdf">Download Manual PDF</a>\n              </div>'
  ],
  [
    '<h2 id="martello-eula-title">End User License Agreement</h2>\n          <p class="detail-copy">Martello and MartelloX2 by MontroneDSP. Downloading a trial package constitutes acceptance of this agreement.</p>\n          <div class="eula-scroll" tabindex="0" aria-label="Martello End User License Agreement version 1.0.1">\n            <p class="eula-meta"><strong>Version 1.0.1</strong><br />Last updated: 14 June 2026</p>',
    '<h2 id="martello-eula-title" data-i18n="demo.eulaTitle">End User License Agreement</h2>\n          <p class="detail-copy" data-i18n="demo.eulaIntro">Martello and MartelloX2 by MontroneDSP. Downloading a trial package constitutes acceptance of this agreement.</p>\n          <div class="eula-scroll" tabindex="0" aria-label="Martello End User License Agreement version 1.0.1" data-i18n-aria="demo.eulaAria">\n            <p class="eula-meta" data-i18n="demo.eulaMeta" data-i18n-html><strong>Version 1.0.1</strong><br />Last updated: 14 June 2026</p>'
  ],
  [
    '<a class="btn btn-primary" href="https://store.montronedsp.com/l/martello" target="_blank" rel="noopener noreferrer">Buy Full Version</a>\n          <a class="btn btn-secondary" href="./">Back to Home</a>',
    '<a class="btn btn-primary" href="https://store.montronedsp.com/l/martello" target="_blank" rel="noopener noreferrer" data-i18n="demo.buyFull">Buy Full Version</a>\n          <a class="btn btn-secondary" href="./" data-i18n="common.backHome">Back to Home</a>'
  ]
]);

// MODI
ensurePageAttr('modi.html', 'modi');
patchFile('modi.html', [
  [
    'aria-label="MontroneDSP home"',
    'aria-label="MontroneDSP home" data-i18n-aria="nav.homeAria"'
  ],
  [
    `<nav class="site-nav" aria-label="Main navigation">
          <a class="nav-link" href="free.html">Free</a>
        </nav>`,
    `<nav class="site-nav" aria-label="Main navigation" data-i18n-aria="nav.mainAria">
          <a class="nav-link" href="free.html" data-i18n="nav.free">Free</a>
          <label class="site-lang">
            <span class="sr-only" data-i18n="lang.label">Language</span>
            <select class="site-lang-select" aria-label="Language" data-i18n-aria="lang.aria"></select>
          </label>
        </nav>`
  ],
  [
    '<p class="footer-copy">© <span id="year"></span> MontroneDSP. MontroneDSP is a registered trademark.</p>',
    '<p class="footer-copy" data-i18n="footer.copy">© {year} MontroneDSP. MontroneDSP is a registered trademark.</p>'
  ],
  ...addI18nScript,
  [
    '<section class="hero" aria-label="Archived Modi hero">',
    '<section class="hero" aria-label="Archived Modi hero" data-i18n-aria="modi.heroAria">'
  ],
  [
    '<p class="hero-lead">Archived legacy concept for a tuned resonator instrument.</p>\n              <div class="hero-actions">\n                <a class="btn btn-secondary" href="free.html">Visit the current free tools page</a>\n              </div>',
    '<p class="hero-lead" data-i18n="modi.lead">Archived legacy concept for a tuned resonator instrument.</p>\n              <div class="hero-actions">\n                <a class="btn btn-secondary" href="free.html" data-i18n="modi.cta">Visit the current free tools page</a>\n              </div>'
  ],
  [
    '<section class="plugin-story" aria-label="Archived Modi concept">',
    '<section class="plugin-story" aria-label="Archived Modi concept" data-i18n-aria="modi.storyAria">'
  ],
  [
    '<p class="story-index"><span>Archive</span><span>Legacy concept</span></p>\n            <h2 class="story-moment-title">This page preserves the earlier Modi-focused version of the free experience.</h2>\n            <p class="story-moment-body">The current free page is now focused on practical tools and a simpler layout. This archived page remains available as a reference for the earlier resonator-instrument concept.</p>\n            <p class="story-moment-body">It explored struck physical tones, tuned resonant bodies, mallet percussion, and a compact synthesis approach around contact, damping, and bloom.</p>',
    '<p class="story-index"><span data-i18n="modi.eyebrowArchive">Archive</span><span data-i18n="modi.eyebrowLegacy">Legacy concept</span></p>\n            <h2 class="story-moment-title" data-i18n="modi.title">This page preserves the earlier Modi-focused version of the free experience.</h2>\n            <p class="story-moment-body" data-i18n="modi.body1">The current free page is now focused on practical tools and a simpler layout. This archived page remains available as a reference for the earlier resonator-instrument concept.</p>\n            <p class="story-moment-body" data-i18n="modi.body2">It explored struck physical tones, tuned resonant bodies, mallet percussion, and a compact synthesis approach around contact, damping, and bloom.</p>'
  ]
]);

console.log('Page patches complete (privacy next)');
