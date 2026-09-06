import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const file = path.join(root, 'privacy.html');
let html = fs.readFileSync(file, 'utf8');
const nl = html.includes('\r\n') ? '\r\n' : '\n';
const norm = (s) => s.replace(/\r\n|\n/g, nl);

if (!html.includes('data-i18n-page="privacy"')) {
  html = html.replace('lang="en"', 'lang="en" data-i18n-page="privacy"');
}

const reps = [
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
  ],
  [
    `<nav class="site-nav" aria-label="Main navigation">
          <a class="nav-link" href="martello-demo.html">Demo</a>
          <a class="nav-link" href="https://store.montronedsp.com/" target="_blank" rel="noopener noreferrer">Store</a>
          <a class="nav-link" href="free.html">Free</a>
        </nav>`,
    `<nav class="site-nav" aria-label="Main navigation" data-i18n-aria="nav.mainAria">
          <a class="nav-link" href="martello-demo.html" data-i18n="nav.demo">Demo</a>
          <a class="nav-link" href="https://store.montronedsp.com/" target="_blank" rel="noopener noreferrer" data-i18n="nav.store">Store</a>
          <a class="nav-link" href="free.html" data-i18n="nav.free">Free</a>
          <label class="site-lang">
            <span class="sr-only" data-i18n="lang.label">Language</span>
            <select class="site-lang-select" aria-label="Language" data-i18n-aria="lang.aria"></select>
          </label>
        </nav>`
  ],
  [
    `<h2 id="social-title" class="social-title">Follow us on social</h2>
        <nav class="social-nav" aria-label="Social media">`,
    `<h2 id="social-title" class="social-title" data-i18n="social.title">Follow us on social</h2>
        <nav class="social-nav" aria-label="Social media" data-i18n-aria="social.navAria">`
  ],
  [
    `<p class="footer-copy">© <span id="year"></span> MontroneDSP. MontroneDSP is a registered trademark.</p>
        <nav class="footer-nav" aria-label="Footer navigation">
          <a href="https://store.montronedsp.com/" target="_blank" rel="noopener noreferrer">Store</a>
          <a href="dawless.html">DAWLESS</a>
          <a href="contact.html">Contact</a>
          <a href="free.html">Free</a>
          <a href="privacy.html" aria-current="page">Privacy</a>
        </nav>`,
    `<p class="footer-copy" data-i18n="footer.copy">© {year} MontroneDSP. MontroneDSP is a registered trademark.</p>
        <nav class="footer-nav" aria-label="Footer navigation" data-i18n-aria="footer.navAria">
          <a href="https://store.montronedsp.com/" target="_blank" rel="noopener noreferrer" data-i18n="footer.store">Store</a>
          <a href="dawless.html" data-i18n="footer.dawless">DAWLESS</a>
          <a href="contact.html" data-i18n="footer.contact">Contact</a>
          <a href="free.html" data-i18n="footer.free">Free</a>
          <a href="privacy.html" aria-current="page" data-i18n="footer.privacy">Privacy</a>
        </nav>`
  ],
  ['</div>\n</body>', '</div>\n  <script src="i18n.js"></script>\n  <script src="script.js"></script>\n</body>'],
  ['<h1>Privacy Policy</h1>', '<h1 data-i18n="privacy.title">Privacy Policy</h1>'],
  [
    '<p class="hero-copy">MontroneDSP plugins are built to minimize data collection. Internet access is required only for license activation, license-related checks, purchases, downloads, support, and website operation  -  not to collect information about your music, sessions, presets, MIDI, or audio.</p>',
    '<p class="hero-copy" data-i18n="privacy.lead">MontroneDSP plugins are built to minimize data collection. Internet access is required only for license activation, license-related checks, purchases, downloads, support, and website operation  -  not to collect information about your music, sessions, presets, MIDI, or audio.</p>'
  ],
  [
    '<p class="privacy-meta"><strong>Last updated: 27 June 2026</strong></p>\n            <p>This Privacy Policy explains how MontroneDSP processes personal data when you use our website, purchase or download our products, activate a license, join a test/demo program, or contact us for support.</p>',
    '<p class="privacy-meta" data-i18n="privacy.updated" data-i18n-html><strong>Last updated: 27 June 2026</strong></p>\n            <p data-i18n="privacy.intro">This Privacy Policy explains how MontroneDSP processes personal data when you use our website, purchase or download our products, activate a license, join a test/demo program, or contact us for support.</p>'
  ]
];

// Mark remaining privacy body with data-i18n via structured replacements
const bodyReps = [
  ['<h2>1. Data controller</h2>', '<h2 data-i18n="privacy.h1">1. Data controller</h2>'],
  ['<p>The data controller is:</p>', '<p data-i18n="privacy.h1p1">The data controller is:</p>'],
  [
    '<p><strong>MontroneDSP / Andrea Montrone</strong><br />Italy<br />Contact: <a href="mailto:support@montronedsp.com">support@montronedsp.com</a></p>',
    '<p data-i18n="privacy.h1p2" data-i18n-html><strong>MontroneDSP / Andrea Montrone</strong><br />Italy<br />Contact: <a href="mailto:support@montronedsp.com">support@montronedsp.com</a></p>'
  ],
  [
    '<p>For privacy questions, correction requests, deletion requests, or any other data-related request, contact us at the email address above.</p>',
    '<p data-i18n="privacy.h1p3">For privacy questions, correction requests, deletion requests, or any other data-related request, contact us at the email address above.</p>'
  ],
  ['<h2>2. Plugins</h2>', '<h2 data-i18n="privacy.h2">2. Plugins</h2>'],
  [
    '<p class="privacy-highlight">Martello and MartelloX2 are local instruments that run inside your DAW. We do not use subscriptions, always-online business models, or cloud-tied project storage.</p>',
    '<p class="privacy-highlight" data-i18n="privacy.h2highlight">Martello and MartelloX2 are local instruments that run inside your DAW. We do not use subscriptions, always-online business models, or cloud-tied project storage.</p>'
  ],
  [
    '<p>Your DAW sessions, presets, MIDI, and audio remain on your machine.</p>',
    '<p data-i18n="privacy.h2p1">Your DAW sessions, presets, MIDI, and audio remain on your machine.</p>'
  ],
  [
    '<p>MontroneDSP plugins do not collect usage analytics, telemetry, crash reports, diagnostic uploads, or information about how you make music.</p>',
    '<p data-i18n="privacy.h2p2">MontroneDSP plugins do not collect usage analytics, telemetry, crash reports, diagnostic uploads, or information about how you make music.</p>'
  ],
  ['<p>We do not collect:</p>', '<p data-i18n="privacy.h2p3">We do not collect:</p>'],
  ['<li>audio from your projects</li>', '<li data-i18n="privacy.h2li1">audio from your projects</li>'],
  ['<li>DAW session data</li>', '<li data-i18n="privacy.h2li2">DAW session data</li>'],
  ['<li>MIDI patterns</li>', '<li data-i18n="privacy.h2li3">MIDI patterns</li>'],
  ['<li>presets or user sounds</li>', '<li data-i18n="privacy.h2li4">presets or user sounds</li>'],
  ['<li>usage analytics</li>', '<li data-i18n="privacy.h2li5">usage analytics</li>'],
  ['<li>crash reports</li>', '<li data-i18n="privacy.h2li6">crash reports</li>'],
  ['<li>telemetry</li>', '<li data-i18n="privacy.h2li7">telemetry</li>'],
  ['<li>diagnostic logs</li>', '<li data-i18n="privacy.h2li8">diagnostic logs</li>'],
  ['<h2>3. License activation</h2>', '<h2 data-i18n="privacy.h3">3. License activation</h2>'],
  [
    '<p>An internet connection may be required for license activation and occasional license-related checks. After activation, the plugin can be used offline within the terms of your license.</p>',
    '<p data-i18n="privacy.h3p1">An internet connection may be required for license activation and occasional license-related checks. After activation, the plugin can be used offline within the terms of your license.</p>'
  ],
  [
    '<p>To activate and manage a license, the licensing system may process information required to validate your purchase and manage your activations. This may include:</p>',
    '<p data-i18n="privacy.h3p2">To activate and manage a license, the licensing system may process information required to validate your purchase and manage your activations. This may include:</p>'
  ],
  ['<li>license key</li>', '<li data-i18n="privacy.h3li1">license key</li>'],
  ['<li>purchase email</li>', '<li data-i18n="privacy.h3li2">purchase email</li>'],
  ['<li>activation status</li>', '<li data-i18n="privacy.h3li3">activation status</li>'],
  ['<li>machine/license identifier</li>', '<li data-i18n="privacy.h3li4">machine/license identifier</li>'],
  ['<li>number of activated machines</li>', '<li data-i18n="privacy.h3li5">number of activated machines</li>'],
  ['<li>IP address</li>', '<li data-i18n="privacy.h3li6">IP address</li>'],
  ['<li>request timestamps</li>', '<li data-i18n="privacy.h3li7">request timestamps</li>'],
  [
    '<li>basic technical information required for license validation</li>',
    '<li data-i18n="privacy.h3li8">basic technical information required for license validation</li>'
  ],
  [
    '<p>This information is used only to activate the software, prevent license abuse, provide support, manage the number of allowed machines under your license, and protect the security of the licensing system.</p>',
    '<p data-i18n="privacy.h3p3">This information is used only to activate the software, prevent license abuse, provide support, manage the number of allowed machines under your license, and protect the security of the licensing system.</p>'
  ],
  [
    '<p><strong>Lawful basis:</strong> performance of a contract, legitimate interests, and, where applicable, compliance with legal obligations.</p>\n            </div>\n\n            <div class="privacy-section">\n              <h2>4. Store purchases</h2>',
    '<p data-i18n="privacy.h3basis" data-i18n-html><strong>Lawful basis:</strong> performance of a contract, legitimate interests, and, where applicable, compliance with legal obligations.</p>\n            </div>\n\n            <div class="privacy-section">\n              <h2 data-i18n="privacy.h4">4. Store purchases</h2>'
  ]
];

let missing = 0;
for (const [fromRaw, toRaw] of [...reps, ...bodyReps]) {
  const from = norm(fromRaw);
  const to = norm(toRaw);
  if (!html.includes(from)) {
    console.error('MISSING:', fromRaw.slice(0, 90).replace(/\n/g, '\\n'));
    missing++;
    continue;
  }
  html = html.replace(from, to);
}

// Remaining sections 4-14: apply via a second-pass map of unique strings
const more = [
  [
    '<p>When you buy MontroneDSP products through the MontroneDSP store, payment and delivery may be handled by Gumroad or another payment/delivery provider.</p>',
    '<p data-i18n="privacy.h4p1">When you buy MontroneDSP products through the MontroneDSP store, payment and delivery may be handled by Gumroad or another payment/delivery provider.</p>'
  ],
  [
    '<p>Gumroad processes the information required to complete your order, deliver your product, issue receipts, and handle payment-related services. MontroneDSP does not directly receive or store your payment card details.</p>',
    '<p data-i18n="privacy.h4p2">Gumroad processes the information required to complete your order, deliver your product, issue receipts, and handle payment-related services. MontroneDSP does not directly receive or store your payment card details.</p>'
  ],
  [
    '<p>MontroneDSP may receive limited order information needed to deliver the product, provide support, manage licenses, and keep business records. This may include:</p>',
    '<p data-i18n="privacy.h4p3">MontroneDSP may receive limited order information needed to deliver the product, provide support, manage licenses, and keep business records. This may include:</p>'
  ],
  ['<li>name, if provided</li>', '<li data-i18n="privacy.h4li1">name, if provided</li>'],
  ['<li>email address</li>', '<li data-i18n="privacy.h4li2">email address</li>'],
  ['<li>product purchased</li>', '<li data-i18n="privacy.h4li3">product purchased</li>'],
  ['<li>order date</li>', '<li data-i18n="privacy.h4li4">order date</li>'],
  ['<li>license or download information</li>', '<li data-i18n="privacy.h4li5">license or download information</li>'],
  [
    '<li>country or tax-related information, where provided by the store platform</li>',
    '<li data-i18n="privacy.h4li6">country or tax-related information, where provided by the store platform</li>'
  ],
  [
    '<li>support or refund-related correspondence</li>',
    '<li data-i18n="privacy.h4li7">support or refund-related correspondence</li>'
  ],
  [
    '<p>Please refer to <a href="https://gumroad.com/privacy" target="_blank" rel="noopener noreferrer">Gumroad’s Privacy Policy</a> for details about how Gumroad handles purchase and payment data.</p>',
    '<p data-i18n="privacy.h4p4" data-i18n-html>Please refer to <a href="https://gumroad.com/privacy" target="_blank" rel="noopener noreferrer">Gumroad’s Privacy Policy</a> for details about how Gumroad handles purchase and payment data.</p>'
  ],
  [
    '<p><strong>Lawful basis:</strong> performance of a contract, compliance with legal obligations, and legitimate interests.</p>\n            </div>\n\n            <div class="privacy-section">\n              <h2>5. Demo downloads</h2>',
    '<p data-i18n="privacy.h4basis" data-i18n-html><strong>Lawful basis:</strong> performance of a contract, compliance with legal obligations, and legitimate interests.</p>\n            </div>\n\n            <div class="privacy-section">\n              <h2 data-i18n="privacy.h5">5. Demo downloads</h2>'
  ],
  [
    '<p>If you download a MontroneDSP demo from this website, we may process limited technical information related to that download, such as:</p>',
    '<p data-i18n="privacy.h5p1">If you download a MontroneDSP demo from this website, we may process limited technical information related to that download, such as:</p>'
  ],
  ['<li>operating system choice</li>', '<li data-i18n="privacy.h5li1">operating system choice</li>'],
  ['<li>product version downloaded</li>', '<li data-i18n="privacy.h5li2">product version downloaded</li>'],
  [
    '<li>basic technical request data from the hosting provider</li>',
    '<li data-i18n="privacy.h5li3">basic technical request data from the hosting provider</li>'
  ],
  [
    '<p>This information is used to provide demo access, maintain download availability, understand reported issues, improve the software, and keep the website secure.</p>',
    '<p data-i18n="privacy.h5p2">This information is used to provide demo access, maintain download availability, understand reported issues, improve the software, and keep the website secure.</p>'
  ],
  [
    '<p><strong>Lawful basis:</strong> performance of a contract or pre-contractual request, and legitimate interests.</p>\n            </div>\n\n            <div class="privacy-section">\n              <h2>6. Contact and support</h2>',
    '<p data-i18n="privacy.h5basis" data-i18n-html><strong>Lawful basis:</strong> performance of a contract or pre-contractual request, and legitimate interests.</p>\n            </div>\n\n            <div class="privacy-section">\n              <h2 data-i18n="privacy.h6">6. Contact and support</h2>'
  ],
  [
    '<p>If you email MontroneDSP for support, we receive your email address, your message, and any information you choose to include.</p>',
    '<p data-i18n="privacy.h6p1">If you email MontroneDSP for support, we receive your email address, your message, and any information you choose to include.</p>'
  ],
  [
    '<p>This correspondence is used only to respond to your request, provide customer support, resolve technical issues, maintain necessary business records, and improve the reliability of our products.</p>',
    '<p data-i18n="privacy.h6p2">This correspondence is used only to respond to your request, provide customer support, resolve technical issues, maintain necessary business records, and improve the reliability of our products.</p>'
  ],
  [
    '<p>Please avoid sending unnecessary personal information, private project files, or sensitive data unless needed for support.</p>',
    '<p data-i18n="privacy.h6p3">Please avoid sending unnecessary personal information, private project files, or sensitive data unless needed for support.</p>'
  ],
  [
    '<p><strong>Lawful basis:</strong> performance of a contract, legitimate interests, and, where applicable, compliance with legal obligations.</p>\n            </div>\n\n            <div class="privacy-section">\n              <h2>7. Website</h2>',
    '<p data-i18n="privacy.h6basis" data-i18n-html><strong>Lawful basis:</strong> performance of a contract, legitimate interests, and, where applicable, compliance with legal obligations.</p>\n            </div>\n\n            <div class="privacy-section">\n              <h2 data-i18n="privacy.h7">7. Website</h2>'
  ],
  [
    '<p>MontroneDSP does not intentionally use analytics trackers or advertising trackers on the main website.</p>',
    '<p data-i18n="privacy.h7p1">MontroneDSP does not intentionally use analytics trackers or advertising trackers on the main website.</p>'
  ],
  ['<p>We do not currently use:</p>', '<p data-i18n="privacy.h7p2">We do not currently use:</p>'],
  ['<li>analytics trackers</li>', '<li data-i18n="privacy.h7li1">analytics trackers</li>'],
  ['<li>advertising trackers</li>', '<li data-i18n="privacy.h7li2">advertising trackers</li>'],
  ['<li>third-party behavioral tracking</li>', '<li data-i18n="privacy.h7li3">third-party behavioral tracking</li>'],
  ['<li>always-on user profiling</li>', '<li data-i18n="privacy.h7li4">always-on user profiling</li>'],
  [
    '<p>Standard web server logs from the hosting provider may still record technical information such as:</p>',
    '<p data-i18n="privacy.h7p3">Standard web server logs from the hosting provider may still record technical information such as:</p>'
  ],
  // IP address etc. may already be tagged from section 3 - use unique context
  [
    `<p>Standard web server logs from the hosting provider may still record technical information such as:</p>
              <ul>
                <li>IP address</li>
                <li>browser type</li>
                <li>requested pages</li>
                <li>request timestamps</li>
                <li>referring page</li>
                <li>basic device or technical request data</li>
              </ul>`,
    `<p data-i18n="privacy.h7p3">Standard web server logs from the hosting provider may still record technical information such as:</p>
              <ul>
                <li data-i18n="privacy.h7li5">IP address</li>
                <li data-i18n="privacy.h7li6">browser type</li>
                <li data-i18n="privacy.h7li7">requested pages</li>
                <li data-i18n="privacy.h7li8">request timestamps</li>
                <li data-i18n="privacy.h7li9">referring page</li>
                <li data-i18n="privacy.h7li10">basic device or technical request data</li>
              </ul>`
  ]
];

// Fix: h7p3 may have been double-applied - rebuild more carefully for remaining
// Remove the duplicate h7p3 single replace from more and keep block version only
const moreFixed = more.filter((pair) => !pair[0].startsWith('<p>Standard web server logs') || pair[0].includes('<ul>'));

for (const [fromRaw, toRaw] of moreFixed) {
  const from = norm(fromRaw);
  const to = norm(toRaw);
  if (!html.includes(from)) {
    console.error('MISSING2:', fromRaw.slice(0, 90).replace(/\n/g, '\\n'));
    missing++;
    continue;
  }
  html = html.replace(from, to);
}

const tail = [
  [
    '<p>These logs are used for security, maintenance, troubleshooting, abuse prevention, and normal website operation.</p>',
    '<p data-i18n="privacy.h7p4">These logs are used for security, maintenance, troubleshooting, abuse prevention, and normal website operation.</p>'
  ],
  [
    '<p>Third-party services linked from the website, such as Gumroad or other payment/download providers, may use their own cookies, logs, and privacy practices.</p>',
    '<p data-i18n="privacy.h7p5">Third-party services linked from the website, such as Gumroad or other payment/download providers, may use their own cookies, logs, and privacy practices.</p>'
  ],
  [
    '<p><strong>Lawful basis:</strong> legitimate interests and, where applicable, consent or compliance with legal obligations.</p>\n            </div>\n\n            <div class="privacy-section">\n              <h2>8. Service providers and recipients</h2>',
    '<p data-i18n="privacy.h7basis" data-i18n-html><strong>Lawful basis:</strong> legitimate interests and, where applicable, consent or compliance with legal obligations.</p>\n            </div>\n\n            <div class="privacy-section">\n              <h2 data-i18n="privacy.h8">8. Service providers and recipients</h2>'
  ],
  [
    '<p>MontroneDSP may use trusted service providers to operate the website, sell products, deliver downloads, activate licenses, manage email, and provide support.</p>',
    '<p data-i18n="privacy.h8p1">MontroneDSP may use trusted service providers to operate the website, sell products, deliver downloads, activate licenses, manage email, and provide support.</p>'
  ],
  [
    '<p>Depending on the product and purchase flow, these may include:</p>',
    '<p data-i18n="privacy.h8p2">Depending on the product and purchase flow, these may include:</p>'
  ],
  [
    '<li>Gumroad, for store purchases, payments, delivery, receipts, and related services</li>',
    '<li data-i18n="privacy.h8li1">Gumroad, for store purchases, payments, delivery, receipts, and related services</li>'
  ],
  [
    '<li>licensing/activation providers, such as Keygen or equivalent licensing infrastructure</li>',
    '<li data-i18n="privacy.h8li2">licensing/activation providers, such as Keygen or equivalent licensing infrastructure</li>'
  ],
  ['<li>website hosting providers</li>', '<li data-i18n="privacy.h8li3">website hosting providers</li>'],
  ['<li>email providers</li>', '<li data-i18n="privacy.h8li4">email providers</li>'],
  [
    '<li>technical service providers needed for security, maintenance, and support</li>',
    '<li data-i18n="privacy.h8li5">technical service providers needed for security, maintenance, and support</li>'
  ],
  [
    '<p>These providers process data only as needed to provide their services, according to their own privacy policies and applicable data protection requirements.</p>',
    '<p data-i18n="privacy.h8p3">These providers process data only as needed to provide their services, according to their own privacy policies and applicable data protection requirements.</p>'
  ],
  [
    '<p>We do not sell your personal data.</p>',
    '<p data-i18n="privacy.h8p4">We do not sell your personal data.</p>'
  ],
  ['<h2>9. International transfers</h2>', '<h2 data-i18n="privacy.h9">9. International transfers</h2>'],
  [
    '<p>Some service providers may be based outside the European Economic Area or may process data in countries outside the European Economic Area.</p>',
    '<p data-i18n="privacy.h9p1">Some service providers may be based outside the European Economic Area or may process data in countries outside the European Economic Area.</p>'
  ],
  [
    '<p>Where required, transfers are handled using appropriate safeguards, such as contractual protections, adequacy decisions, or other mechanisms permitted by applicable data protection law.</p>',
    '<p data-i18n="privacy.h9p2">Where required, transfers are handled using appropriate safeguards, such as contractual protections, adequacy decisions, or other mechanisms permitted by applicable data protection law.</p>'
  ],
  ['<h2>10. Retention</h2>', '<h2 data-i18n="privacy.h10">10. Retention</h2>'],
  [
    '<p>We keep personal data only for as long as reasonably necessary for the purposes described in this Privacy Policy.</p>',
    '<p data-i18n="privacy.h10p1">We keep personal data only for as long as reasonably necessary for the purposes described in this Privacy Policy.</p>'
  ],
  ['<p>In general:</p>', '<p data-i18n="privacy.h10p2">In general:</p>'],
  [
    '<li>support emails are kept as long as needed for customer service, technical support, and reasonable business record-keeping</li>',
    '<li data-i18n="privacy.h10li1">support emails are kept as long as needed for customer service, technical support, and reasonable business record-keeping</li>'
  ],
  [
    '<li>license and activation records are kept as long as needed to provide access to the software, manage activations, prevent fraud or abuse, and support customers</li>',
    '<li data-i18n="privacy.h10li2">license and activation records are kept as long as needed to provide access to the software, manage activations, prevent fraud or abuse, and support customers</li>'
  ],
  [
    '<li>purchase records are kept as required for accounting, tax, fraud prevention, customer support, and legal obligations</li>',
    '<li data-i18n="privacy.h10li3">purchase records are kept as required for accounting, tax, fraud prevention, customer support, and legal obligations</li>'
  ],
  [
    '<li>demo download records are kept as long as needed for website operation, support, product improvement, and reasonable business records</li>',
    '<li data-i18n="privacy.h10li4">demo download records are kept as long as needed for website operation, support, product improvement, and reasonable business records</li>'
  ],
  [
    '<li>website server logs are retained according to the hosting provider’s normal security and maintenance policies</li>',
    '<li data-i18n="privacy.h10li5">website server logs are retained according to the hosting provider’s normal security and maintenance policies</li>'
  ],
  [
    '<p>When personal data is no longer needed, it will be deleted, anonymized, or retained only where required by law or legitimate business needs.</p>',
    '<p data-i18n="privacy.h10p3">When personal data is no longer needed, it will be deleted, anonymized, or retained only where required by law or legitimate business needs.</p>'
  ],
  ['<h2>11. Your rights</h2>', '<h2 data-i18n="privacy.h11">11. Your rights</h2>'],
  [
    '<p>Depending on your location and applicable law, you may have the right to:</p>',
    '<p data-i18n="privacy.h11p1">Depending on your location and applicable law, you may have the right to:</p>'
  ],
  ['<li>access your personal data</li>', '<li data-i18n="privacy.h11li1">access your personal data</li>'],
  [
    '<li>request correction of inaccurate data</li>',
    '<li data-i18n="privacy.h11li2">request correction of inaccurate data</li>'
  ],
  ['<li>request deletion of your data</li>', '<li data-i18n="privacy.h11li3">request deletion of your data</li>'],
  [
    '<li>request restriction of processing</li>',
    '<li data-i18n="privacy.h11li4">request restriction of processing</li>'
  ],
  [
    '<li>object to processing based on legitimate interests</li>',
    '<li data-i18n="privacy.h11li5">object to processing based on legitimate interests</li>'
  ],
  [
    '<li>request data portability where applicable</li>',
    '<li data-i18n="privacy.h11li6">request data portability where applicable</li>'
  ],
  [
    '<li>withdraw consent where processing is based on consent</li>',
    '<li data-i18n="privacy.h11li7">withdraw consent where processing is based on consent</li>'
  ],
  [
    '<li>lodge a complaint with a data protection authority</li>',
    '<li data-i18n="privacy.h11li8">lodge a complaint with a data protection authority</li>'
  ],
  ['<p>To exercise your rights, contact:</p>', '<p data-i18n="privacy.h11p2">To exercise your rights, contact:</p>'],
  [
    '<p>We may need to verify your identity before responding to certain requests.</p>',
    '<p data-i18n="privacy.h11p3">We may need to verify your identity before responding to certain requests.</p>'
  ],
  ['<h2>12. Right to complain</h2>', '<h2 data-i18n="privacy.h12">12. Right to complain</h2>'],
  [
    '<p>If you believe your personal data has been processed in a way that violates applicable data protection law, you have the right to lodge a complaint with a supervisory authority.</p>',
    '<p data-i18n="privacy.h12p1">If you believe your personal data has been processed in a way that violates applicable data protection law, you have the right to lodge a complaint with a supervisory authority.</p>'
  ],
  [
    '<p>In Italy, the competent authority is:</p>',
    '<p data-i18n="privacy.h12p2">In Italy, the competent authority is:</p>'
  ],
  [
    '<p><strong>Garante per la protezione dei dati personali</strong></p>',
    '<p data-i18n="privacy.h12p3" data-i18n-html><strong>Garante per la protezione dei dati personali</strong></p>'
  ],
  [
    '<p>You may also contact the data protection authority in your country of residence, workplace, or the place where the alleged violation occurred.</p>',
    '<p data-i18n="privacy.h12p4">You may also contact the data protection authority in your country of residence, workplace, or the place where the alleged violation occurred.</p>'
  ],
  ['<h2>13. No automated profiling</h2>', '<h2 data-i18n="privacy.h13">13. No automated profiling</h2>'],
  [
    '<p>MontroneDSP does not use your personal data for automated profiling, behavioral advertising, or automated decisions that produce legal or similarly significant effects.</p>',
    '<p data-i18n="privacy.h13p1">MontroneDSP does not use your personal data for automated profiling, behavioral advertising, or automated decisions that produce legal or similarly significant effects.</p>'
  ],
  [
    '<p>License activation may automatically check whether a license is valid and whether the allowed number of activations has been reached. This is used only for software licensing and anti-abuse purposes.</p>',
    '<p data-i18n="privacy.h13p2">License activation may automatically check whether a license is valid and whether the allowed number of activations has been reached. This is used only for software licensing and anti-abuse purposes.</p>'
  ],
  [
    '<h2>14. Changes to this Privacy Policy</h2>',
    '<h2 data-i18n="privacy.h14">14. Changes to this Privacy Policy</h2>'
  ],
  [
    '<p>We may update this Privacy Policy from time to time, for example if we change our store, licensing system, website, support process, or legal requirements.</p>',
    '<p data-i18n="privacy.h14p1">We may update this Privacy Policy from time to time, for example if we change our store, licensing system, website, support process, or legal requirements.</p>'
  ],
  [
    '<p>The latest version will be published on the MontroneDSP website with the updated date.</p>',
    '<p data-i18n="privacy.h14p2">The latest version will be published on the MontroneDSP website with the updated date.</p>'
  ]
];

for (const [fromRaw, toRaw] of tail) {
  const from = norm(fromRaw);
  const to = norm(toRaw);
  if (!html.includes(from)) {
    console.error('MISSING3:', fromRaw.slice(0, 90).replace(/\n/g, '\\n'));
    missing++;
    continue;
  }
  html = html.replace(from, to);
}

// Fix duplicate h7p3 attribute if present
html = html.replace(
  'data-i18n="privacy.h7p3">Standard web server logs from the hosting provider may still record technical information such as:</p>\n              <ul>\n                <li>IP address</li>',
  'data-i18n="privacy.h7p3">Standard web server logs from the hosting provider may still record technical information such as:</p>\n              <ul>\n                <li data-i18n="privacy.h7li5">IP address</li>'
);

if (missing) {
  console.error('Total missing:', missing);
  process.exit(1);
}

fs.writeFileSync(file, html, 'utf8');
console.log('patched privacy.html');
