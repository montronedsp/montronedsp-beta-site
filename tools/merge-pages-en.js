import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pagesPath = path.join(root, 'tools', 'pages-en.json');
const enPath = path.join(root, 'locales', 'en.json');

const privacy = {
  meta: {
    title: 'Privacy  -  MontroneDSP',
    description:
      'How MontroneDSP handles personal data for website use, store purchases, license activation, demo downloads, and support. Last updated 27 June 2026.'
  },
  title: 'Privacy Policy',
  lead:
    'MontroneDSP plugins are built to minimize data collection. Internet access is required only for license activation, license-related checks, purchases, downloads, support, and website operation  -  not to collect information about your music, sessions, presets, MIDI, or audio.',
  updated: '<strong>Last updated: 27 June 2026</strong>',
  intro:
    'This Privacy Policy explains how MontroneDSP processes personal data when you use our website, purchase or download our products, activate a license, join a test/demo program, or contact us for support.',
  h1: '1. Data controller',
  h1p1: 'The data controller is:',
  h1p2:
    '<strong>MontroneDSP / Andrea Montrone</strong><br />Italy<br />Contact: <a href="mailto:support@montronedsp.com">support@montronedsp.com</a>',
  h1p3:
    'For privacy questions, correction requests, deletion requests, or any other data-related request, contact us at the email address above.',
  h2: '2. Plugins',
  h2highlight:
    'Martello and MartelloX2 are local instruments that run inside your DAW. We do not use subscriptions, always-online business models, or cloud-tied project storage.',
  h2p1: 'Your DAW sessions, presets, MIDI, and audio remain on your machine.',
  h2p2:
    'MontroneDSP plugins do not collect usage analytics, telemetry, crash reports, diagnostic uploads, or information about how you make music.',
  h2p3: 'We do not collect:',
  h2li1: 'audio from your projects',
  h2li2: 'DAW session data',
  h2li3: 'MIDI patterns',
  h2li4: 'presets or user sounds',
  h2li5: 'usage analytics',
  h2li6: 'crash reports',
  h2li7: 'telemetry',
  h2li8: 'diagnostic logs',
  h3: '3. License activation',
  h3p1:
    'An internet connection may be required for license activation and occasional license-related checks. After activation, the plugin can be used offline within the terms of your license.',
  h3p2:
    'To activate and manage a license, the licensing system may process information required to validate your purchase and manage your activations. This may include:',
  h3li1: 'license key',
  h3li2: 'purchase email',
  h3li3: 'activation status',
  h3li4: 'machine/license identifier',
  h3li5: 'number of activated machines',
  h3li6: 'IP address',
  h3li7: 'request timestamps',
  h3li8: 'basic technical information required for license validation',
  h3p3:
    'This information is used only to activate the software, prevent license abuse, provide support, manage the number of allowed machines under your license, and protect the security of the licensing system.',
  h3basis:
    '<strong>Lawful basis:</strong> performance of a contract, legitimate interests, and, where applicable, compliance with legal obligations.',
  h4: '4. Store purchases',
  h4p1:
    'When you buy MontroneDSP products through the MontroneDSP store, payment and delivery may be handled by Gumroad or another payment/delivery provider.',
  h4p2:
    'Gumroad processes the information required to complete your order, deliver your product, issue receipts, and handle payment-related services. MontroneDSP does not directly receive or store your payment card details.',
  h4p3:
    'MontroneDSP may receive limited order information needed to deliver the product, provide support, manage licenses, and keep business records. This may include:',
  h4li1: 'name, if provided',
  h4li2: 'email address',
  h4li3: 'product purchased',
  h4li4: 'order date',
  h4li5: 'license or download information',
  h4li6: 'country or tax-related information, where provided by the store platform',
  h4li7: 'support or refund-related correspondence',
  h4p4:
    'Please refer to <a href="https://gumroad.com/privacy" target="_blank" rel="noopener noreferrer">Gumroad’s Privacy Policy</a> for details about how Gumroad handles purchase and payment data.',
  h4basis:
    '<strong>Lawful basis:</strong> performance of a contract, compliance with legal obligations, and legitimate interests.',
  h5: '5. Demo downloads',
  h5p1:
    'If you download a MontroneDSP demo from this website, we may process limited technical information related to that download, such as:',
  h5li1: 'operating system choice',
  h5li2: 'product version downloaded',
  h5li3: 'basic technical request data from the hosting provider',
  h5p2:
    'This information is used to provide demo access, maintain download availability, understand reported issues, improve the software, and keep the website secure.',
  h5basis:
    '<strong>Lawful basis:</strong> performance of a contract or pre-contractual request, and legitimate interests.',
  h6: '6. Contact and support',
  h6p1:
    'If you email MontroneDSP for support, we receive your email address, your message, and any information you choose to include.',
  h6p2:
    'This correspondence is used only to respond to your request, provide customer support, resolve technical issues, maintain necessary business records, and improve the reliability of our products.',
  h6p3:
    'Please avoid sending unnecessary personal information, private project files, or sensitive data unless needed for support.',
  h6basis:
    '<strong>Lawful basis:</strong> performance of a contract, legitimate interests, and, where applicable, compliance with legal obligations.',
  h7: '7. Website',
  h7p1:
    'MontroneDSP does not intentionally use analytics trackers or advertising trackers on the main website.',
  h7p2: 'We do not currently use:',
  h7li1: 'analytics trackers',
  h7li2: 'advertising trackers',
  h7li3: 'third-party behavioral tracking',
  h7li4: 'always-on user profiling',
  h7p3:
    'Standard web server logs from the hosting provider may still record technical information such as:',
  h7li5: 'IP address',
  h7li6: 'browser type',
  h7li7: 'requested pages',
  h7li8: 'request timestamps',
  h7li9: 'referring page',
  h7li10: 'basic device or technical request data',
  h7p4:
    'These logs are used for security, maintenance, troubleshooting, abuse prevention, and normal website operation.',
  h7p5:
    'Third-party services linked from the website, such as Gumroad or other payment/download providers, may use their own cookies, logs, and privacy practices.',
  h7basis:
    '<strong>Lawful basis:</strong> legitimate interests and, where applicable, consent or compliance with legal obligations.',
  h8: '8. Service providers and recipients',
  h8p1:
    'MontroneDSP may use trusted service providers to operate the website, sell products, deliver downloads, activate licenses, manage email, and provide support.',
  h8p2: 'Depending on the product and purchase flow, these may include:',
  h8li1: 'Gumroad, for store purchases, payments, delivery, receipts, and related services',
  h8li2: 'licensing/activation providers, such as Keygen or equivalent licensing infrastructure',
  h8li3: 'website hosting providers',
  h8li4: 'email providers',
  h8li5: 'technical service providers needed for security, maintenance, and support',
  h8p3:
    'These providers process data only as needed to provide their services, according to their own privacy policies and applicable data protection requirements.',
  h8p4: 'We do not sell your personal data.',
  h9: '9. International transfers',
  h9p1:
    'Some service providers may be based outside the European Economic Area or may process data in countries outside the European Economic Area.',
  h9p2:
    'Where required, transfers are handled using appropriate safeguards, such as contractual protections, adequacy decisions, or other mechanisms permitted by applicable data protection law.',
  h10: '10. Retention',
  h10p1:
    'We keep personal data only for as long as reasonably necessary for the purposes described in this Privacy Policy.',
  h10p2: 'In general:',
  h10li1:
    'support emails are kept as long as needed for customer service, technical support, and reasonable business record-keeping',
  h10li2:
    'license and activation records are kept as long as needed to provide access to the software, manage activations, prevent fraud or abuse, and support customers',
  h10li3:
    'purchase records are kept as required for accounting, tax, fraud prevention, customer support, and legal obligations',
  h10li4:
    'demo download records are kept as long as needed for website operation, support, product improvement, and reasonable business records',
  h10li5:
    'website server logs are retained according to the hosting provider’s normal security and maintenance policies',
  h10p3:
    'When personal data is no longer needed, it will be deleted, anonymized, or retained only where required by law or legitimate business needs.',
  h11: '11. Your rights',
  h11p1: 'Depending on your location and applicable law, you may have the right to:',
  h11li1: 'access your personal data',
  h11li2: 'request correction of inaccurate data',
  h11li3: 'request deletion of your data',
  h11li4: 'request restriction of processing',
  h11li5: 'object to processing based on legitimate interests',
  h11li6: 'request data portability where applicable',
  h11li7: 'withdraw consent where processing is based on consent',
  h11li8: 'lodge a complaint with a data protection authority',
  h11p2: 'To exercise your rights, contact:',
  h11p3: 'We may need to verify your identity before responding to certain requests.',
  h12: '12. Right to complain',
  h12p1:
    'If you believe your personal data has been processed in a way that violates applicable data protection law, you have the right to lodge a complaint with a supervisory authority.',
  h12p2: 'In Italy, the competent authority is:',
  h12p3: '<strong>Garante per la protezione dei dati personali</strong>',
  h12p4:
    'You may also contact the data protection authority in your country of residence, workplace, or the place where the alleged violation occurred.',
  h13: '13. No automated profiling',
  h13p1:
    'MontroneDSP does not use your personal data for automated profiling, behavioral advertising, or automated decisions that produce legal or similarly significant effects.',
  h13p2:
    'License activation may automatically check whether a license is valid and whether the allowed number of activations has been reached. This is used only for software licensing and anti-abuse purposes.',
  h14: '14. Changes to this Privacy Policy',
  h14p1:
    'We may update this Privacy Policy from time to time, for example if we change our store, licensing system, website, support process, or legal requirements.',
  h14p2: 'The latest version will be published on the MontroneDSP website with the updated date.'
};

const pages = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));
pages.privacy = privacy;
fs.writeFileSync(pagesPath, JSON.stringify(pages, null, 2) + '\n');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
Object.assign(en, pages);
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
console.log('Merged page namespaces into en.json:', Object.keys(pages).join(', '));
