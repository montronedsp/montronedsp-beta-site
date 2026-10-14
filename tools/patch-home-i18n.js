import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const file = path.join(root, 'index.html');
let html = fs.readFileSync(file, 'utf8');
const nl = html.includes('\r\n') ? '\r\n' : '\n';
const norm = (s) => s.replace(/\r\n|\n/g, nl);

const reps = [
  [
    '<a class="brand brand-logo-stack" href="./" aria-label="MontroneDSP home">',
    '<a class="brand brand-logo-stack" href="./" aria-label="MontroneDSP home" data-i18n-aria="nav.homeAria">'
  ],
  [
    '<div class="product-selector product-selector--header" role="tablist" aria-label="Choose product">',
    '<div class="product-selector product-selector--header" role="tablist" aria-label="Choose product" data-i18n-aria="products.chooseAria">'
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
    '<section class="hero" aria-label="Product hero">',
    '<section class="hero" aria-label="Product hero" data-i18n-aria="home.heroAria">'
  ],
  [
    '<p class="hero-lead">Surgical drum synthesis with classic machine attitude.</p>',
    '<p class="hero-lead" data-i18n="home.martello.lead">Surgical drum synthesis with classic machine attitude.</p>'
  ],
  [
    '<a class="btn btn-primary" href="https://store.montronedsp.com/l/martello" target="_blank" rel="noopener noreferrer">Buy Bundle</a>',
    '<a class="btn btn-primary" href="https://store.montronedsp.com/l/martello" target="_blank" rel="noopener noreferrer" data-i18n="home.martello.buy">Buy Bundle</a>'
  ],
  [
    '<a class="btn btn-secondary gumroad-button" href="https://montronedsp.gumroad.com/l/martello?wanted=true" data-gumroad-overlay-checkout="true">Add to Cart</a>',
    '<a class="btn btn-secondary gumroad-button" href="https://montronedsp.gumroad.com/l/martello?wanted=true" data-gumroad-overlay-checkout="true" data-i18n="home.martello.cart">Add to Cart</a>'
  ],
  [
    '<a class="btn btn-secondary" href="martello-manual.html">User Manual</a>',
    '<a class="btn btn-secondary" href="martello-manual.html" data-i18n="home.martello.manual" data-i18n-manual>User Manual</a>'
  ],
  [
    '<ul class="hero-specs" aria-label="Product highlights">\n                <li>Mac VST3/AU</li>\n                <li>Windows VST3</li>\n                <li>Linux VST3</li>\n              </ul>',
    '<ul class="hero-specs" aria-label="Product highlights" data-i18n-aria="home.highlightsAria">\n                <li data-i18n="home.martello.specMac">Mac VST3/AU</li>\n                <li data-i18n="home.martello.specWin">Windows VST3</li>\n                <li data-i18n="home.martello.specLinux">Linux VST3</li>\n              </ul>'
  ],
  [
    '<div class="hero-release" aria-label="Martello v1.1.2 update">',
    '<div class="hero-release" aria-label="Martello v1.1.2 update" data-i18n-aria="home.martello.releaseAria">'
  ],
  [
    '<li>Drum model improvements</li>\n                  <li>GUI improvements</li>',
    '<li data-i18n="home.martello.release1">Drum model improvements</li>\n                  <li data-i18n="home.martello.release2">GUI improvements</li>'
  ],
  [
    'alt="Martello interface screenshot"',
    'alt="Martello interface screenshot" data-i18n-alt="home.martello.artAlt"'
  ],
  [
    '<p class="hero-lead">Three synthesis models  -  Legacy Elements, Modern Modal, and Pipe Engine  -  united by exciter physics, resonator geometry, and a dedicated pitch computer.</p>',
    '<p class="hero-lead" data-i18n="home.membrana.lead">Three synthesis models  -  Legacy Elements, Modern Modal, and Pipe Engine  -  united by exciter physics, resonator geometry, and a dedicated pitch computer.</p>'
  ],
  [
    '<span class="btn btn-primary btn-disabled" aria-disabled="true">Planned September 2026</span>\n                <a class="btn btn-secondary" href="contact.html">Get notified</a>\n              </div>\n              <ul class="hero-specs" aria-label="Product highlights">\n                <li>September 2026</li>\n                <li>Legacy Elements</li>\n                <li>Modern Modal</li>\n                <li>Pipe Engine</li>\n              </ul>',
    '<span class="btn btn-primary btn-disabled" aria-disabled="true" data-i18n="home.membrana.planned">Planned September 2026</span>\n                <a class="btn btn-secondary" href="contact.html" data-i18n="home.membrana.notify">Get notified</a>\n              </div>\n              <ul class="hero-specs" aria-label="Product highlights" data-i18n-aria="home.highlightsAria">\n                <li data-i18n="home.membrana.specDate">September 2026</li>\n                <li data-i18n="home.membrana.specLegacy">Legacy Elements</li>\n                <li data-i18n="home.membrana.specModal">Modern Modal</li>\n                <li data-i18n="home.membrana.specPipe">Pipe Engine</li>\n              </ul>'
  ],
  [
    '<p class="hero-lead">Spectral gallery reverb with bright public-space reflections and immersive spatial motion.</p>',
    '<p class="hero-lead" data-i18n="home.galleria.lead">Spectral gallery reverb with bright public-space reflections and immersive spatial motion.</p>'
  ],
  [
    '<span class="btn btn-primary btn-disabled" aria-disabled="true">Releases 1 August 2026</span>\n                <a class="btn btn-secondary" href="contact.html">Get notified</a>\n              </div>\n              <ul class="hero-specs" aria-label="Product highlights">\n                <li>01 August 2026</li>\n                <li>Space + delay</li>\n                <li>3D motion</li>\n              </ul>',
    '<span class="btn btn-primary btn-disabled" aria-disabled="true" data-i18n="home.galleria.planned">Releases 1 August 2026</span>\n                <a class="btn btn-secondary" href="contact.html" data-i18n="home.galleria.notify">Get notified</a>\n              </div>\n              <ul class="hero-specs" aria-label="Product highlights" data-i18n-aria="home.highlightsAria">\n                <li data-i18n="home.galleria.specDate">01 August 2026</li>\n                <li data-i18n="home.galleria.specSpace">Space + delay</li>\n                <li data-i18n="home.galleria.specMotion">3D motion</li>\n              </ul>'
  ],
  [
    '<div class="plugin-story" data-product-only="martello" aria-label="Martello product story">',
    '<div class="plugin-story" data-product-only="martello" aria-label="Martello product story" data-i18n-aria="home.martello.storyAria">'
  ],
  [
    'alt="MartelloX2 full dark interface with six voices in Classic Advanced View"',
    'alt="MartelloX2 full dark interface with six voices in Classic Advanced View" data-i18n-alt="home.martello.openShotAlt"'
  ],
  [
    '<p class="story-index"><span>Martello Bundle</span><span>v1.1.2</span></p>\n                <h2 id="story-intro-title" class="story-chapter-title">Built for the grid.</h2>\n                <p class="story-chapter-lede">Martello is built around synthesized drum voices with a strong resonator and modal-synthesis influence.</p>\n                <p class="story-open-body">Its sound is shaped by the idea of struck objects, vibrating bodies, wood, metal, membranes, and physical percussion behavior. Martello and MartelloX2 are focused drum synthesizers, not sample players. Design kicks, snares, hats, and percussion with immediate control, per-voice model selection, and optional dual-engine routing for full-kit patterns in one plugin.</p>',
    '<p class="story-index"><span data-i18n="home.martello.bundleLabel">Martello Bundle</span><span>v1.1.2</span></p>\n                <h2 id="story-intro-title" class="story-chapter-title" data-i18n="home.martello.introTitle">Built for the grid.</h2>\n                <p class="story-chapter-lede" data-i18n="home.martello.introLede">Martello is built around synthesized drum voices with a strong resonator and modal-synthesis influence.</p>\n                <p class="story-open-body" data-i18n="home.martello.introBody">Its sound is shaped by the idea of struck objects, vibrating bodies, wood, metal, membranes, and physical percussion behavior. Martello and MartelloX2 are focused drum synthesizers, not sample players. Design kicks, snares, hats, and percussion with immediate control, per-voice model selection, and optional dual-engine routing for full-kit patterns in one plugin.</p>'
  ],
  [
    '<section class="story-statement-band" aria-label="Martello philosophy">',
    '<section class="story-statement-band" aria-label="Martello philosophy" data-i18n-aria="home.martello.philosophyAria">'
  ],
  [
    '<p>Martello is not a sample pack. It is a synthesized drum instrument with resonator and modal character: dry, direct, and physical.</p>',
    '<p data-i18n="home.martello.statement">Martello is not a sample pack. It is a synthesized drum instrument with resonator and modal character: dry, direct, and physical.</p>'
  ],
  [
    'alt="Martello Dark Modulator Voice 1 interface screenshot"',
    'alt="Martello Dark Modulator Voice 1 interface screenshot" data-i18n-alt="home.martello.modulatorAlt"'
  ],
  [
    '<div class="story-band container" aria-label="Core capabilities">\n          <ul class="story-band-list">\n            <li><span class="story-band-key">Models</span><span class="story-band-val">15 per voice</span></li>\n            <li><span class="story-band-key">Voices</span><span class="story-band-val">3 independent channels</span></li>\n            <li><span class="story-band-key">Modulation</span><span class="story-band-val">LFO or envelope each voice</span></li>\n            <li><span class="story-band-key">Themes</span><span class="story-band-val">Dark and light</span></li>\n          </ul>\n        </div>',
    '<div class="story-band container" aria-label="Core capabilities" data-i18n-aria="home.martello.capabilitiesAria">\n          <ul class="story-band-list">\n            <li><span class="story-band-key" data-i18n="home.martello.bandModels">Models</span><span class="story-band-val" data-i18n="home.martello.bandModelsVal">15 per voice</span></li>\n            <li><span class="story-band-key" data-i18n="home.martello.bandVoices">Voices</span><span class="story-band-val" data-i18n="home.martello.bandVoicesVal">3 independent channels</span></li>\n            <li><span class="story-band-key" data-i18n="home.martello.bandMod">Modulation</span><span class="story-band-val" data-i18n="home.martello.bandModVal">LFO or envelope each voice</span></li>\n            <li><span class="story-band-key" data-i18n="home.martello.bandThemes">Themes</span><span class="story-band-val" data-i18n="home.martello.bandThemesVal">Dark and light</span></li>\n          </ul>\n        </div>'
  ],
  [
    '<p class="story-index"><span>Model engine</span></p>\n              <h3 id="story-models-title" class="story-moment-title">Every voice chooses its own physics.</h3>\n              <p class="story-moment-body">Classic, Classic Extended, Digital, Analog, Digital+, Toms, Clap, Wood, Ride, Cymbal, Cowbell, and Expert variants. Change mode and the panel reconfigures instantly.</p>',
    '<p class="story-index"><span data-i18n="home.martello.modelIndex">Model engine</span></p>\n              <h3 id="story-models-title" class="story-moment-title" data-i18n="home.martello.modelTitle">Every voice chooses its own physics.</h3>\n              <p class="story-moment-body" data-i18n="home.martello.modelBody">Classic, Classic Extended, Digital, Analog, Digital+, Toms, Clap, Wood, Ride, Cymbal, Cowbell, and Expert variants. Change mode and the panel reconfigures instantly.</p>'
  ],
  [
    'alt="Martello voices 1, 2, and 3 model selectors"',
    'alt="Martello voices 1, 2, and 3 model selectors" data-i18n-alt="home.martello.voicesAlt"'
  ],
  [
    '<section class="story-moment container" aria-label="For producers and trial">',
    '<section class="story-moment container" aria-label="For producers and trial" data-i18n-aria="home.martello.producersAria">'
  ],
  [
    '<p>Made for producers who want drums that feel played, tuned, pushed, and shaped. Not just selected from a folder.</p>',
    '<p data-i18n="home.martello.producersStatement">Made for producers who want drums that feel played, tuned, pushed, and shaped. Not just selected from a folder.</p>'
  ],
  [
    '<p class="story-index"><span>Martello Demo</span><span>7-day trial</span></p>\n              <h3 id="story-demo-title" class="story-demo-title">Try before you buy.</h3>\n              <p class="story-demo-copy">macOS, Windows, and Linux. Downloads, install notes, and EULA on the demo page.</p>\n              <a class="btn btn-primary" href="martello-demo.html">Download Trial</a>',
    '<p class="story-index"><span data-i18n="home.martello.demoLabel">Martello Demo</span><span data-i18n="home.martello.demoTrial">7-day trial</span></p>\n              <h3 id="story-demo-title" class="story-demo-title" data-i18n="home.martello.demoTitle">Try before you buy.</h3>\n              <p class="story-demo-copy" data-i18n="home.martello.demoCopy">macOS, Windows, and Linux. Downloads, install notes, and EULA on the demo page.</p>\n              <a class="btn btn-primary" href="martello-demo.html" data-i18n="home.martello.demoCta">Download Trial</a>'
  ],
  [
    '<p class="story-index"><span>Listen</span><span>SoundCloud</span></p>\n            <h2 id="martello-audio-title" class="story-chapter-title">Martello sound examples.</h2>',
    '<p class="story-index"><span data-i18n="home.martello.listenLabel">Listen</span><span>SoundCloud</span></p>\n            <h2 id="martello-audio-title" class="story-chapter-title" data-i18n="home.martello.audioTitle">Martello sound examples.</h2>'
  ],
  [
    '<h3 class="story-moment-title">Dry engine recordings and musical demos</h3>\n              <p class="story-moment-body soundcloud-feature-lede">Hear Martello voices, models, and drum characters in context  -  synthetic kicks, snares, hats, and tuned percussion from the engine.</p>',
    '<h3 class="story-moment-title" data-i18n="home.martello.audioCardTitle">Dry engine recordings and musical demos</h3>\n              <p class="story-moment-body soundcloud-feature-lede" data-i18n="home.martello.audioLede">Hear Martello voices, models, and drum characters in context  -  synthetic kicks, snares, hats, and tuned percussion from the engine.</p>'
  ],
  [
    'Open playlist on SoundCloud\n              </a>',
    '<span data-i18n="home.martello.audioLink">Open playlist on SoundCloud</span>\n              </a>'
  ],
  [
    'title="Martello Sound Examples  -  MontroneDSP SoundCloud playlist"',
    'title="Martello Sound Examples  -  MontroneDSP SoundCloud playlist" data-i18n-title="home.martello.audioIframeTitle"'
  ],
  [
    '<p class="story-index"><span>Release Validation</span><span>Quality checks</span></p>\n            <h2 id="martello-release-validation-title" class="story-chapter-title">Release Validation</h2>',
    '<p class="story-index"><span data-i18n="home.martello.validationIndex">Release Validation</span><span data-i18n="home.martello.validationQuality">Quality checks</span></p>\n            <h2 id="martello-release-validation-title" class="story-chapter-title" data-i18n="home.martello.validationTitle">Release Validation</h2>'
  ],
  [
    '<p>Every MontroneDSP release is checked through automated validation, internal signal analysis, stress testing, and human musical testing.</p>\n              <p>Validation includes <strong>pluginval correctness level 10</strong>, sample-rate testing up to <strong>192 kHz</strong>, automation stress tests, repeated load/unload checks, multi-instance sessions, save/reload verification, preset recall, MIDI triggering, rapid parameter changes, offline rendering, and internal monitoring for signal integrity.</p>\n              <p>MartelloX2 is additionally tested for dual-engine behavior, multi-output routing, heavier session conditions, and real-world usability inside actual DAW projects.</p>',
    '<p data-i18n="home.martello.validationP1">Every MontroneDSP release is checked through automated validation, internal signal analysis, stress testing, and human musical testing.</p>\n              <p data-i18n="home.martello.validationP2" data-i18n-html>Validation includes <strong>pluginval correctness level 10</strong>, sample-rate testing up to <strong>192 kHz</strong>, automation stress tests, repeated load/unload checks, multi-instance sessions, save/reload verification, preset recall, MIDI triggering, rapid parameter changes, offline rendering, and internal monitoring for signal integrity.</p>\n              <p data-i18n="home.martello.validationP3">MartelloX2 is additionally tested for dual-engine behavior, multi-output routing, heavier session conditions, and real-world usability inside actual DAW projects.</p>'
  ],
  [
    '<p class="story-index"><span>Dev story</span><span>Since 2014</span></p>\n          <h2 id="martello-dev-story-title" class="story-chapter-title">Where Martello came from.</h2>',
    '<p class="story-index"><span data-i18n="home.martello.devIndex">Dev story</span><span data-i18n="home.martello.devSince">Since 2014</span></p>\n          <h2 id="martello-dev-story-title" class="story-chapter-title" data-i18n="home.martello.devTitle">Where Martello came from.</h2>'
  ],
  [
    '<p>Martello is an idea that started forming around 2014, when I was exploring Eurorack synthesis, resonators, and modal synthesis. I was always drawn to those tones because they felt more physical, natural, and alive than many traditional electronic drum sounds. They had the feeling of objects being struck, vibrating, and reacting in a real space.</p>\n            <p>For a long time, I tried to reach that feeling with samples, but it never really worked for me.</p>\n            <p>Over time, the idea started moving more clearly toward synthesized drums, using resonators and physical approaches rather than relying only on samples.</p>\n            <p>That direction became the foundation of Martello: a focused drum instrument made to feel immediate, responsive, and alive. While I was also working on a much more complex instrument, Martello naturally became something more direct, simple to understand, quick to use, and centered on sound.</p>\n            <p>The interface follows the same idea: no complicated submenus, with the main controls visible and ready to shape. Martello is built around limitations, but in a creative way, giving artists a starting point to design their own drum kits and then place them inside their own effects, space, and workflow.</p>',
    '<p data-i18n="home.martello.devP1">Martello is an idea that started forming around 2014, when I was exploring Eurorack synthesis, resonators, and modal synthesis. I was always drawn to those tones because they felt more physical, natural, and alive than many traditional electronic drum sounds. They had the feeling of objects being struck, vibrating, and reacting in a real space.</p>\n            <p data-i18n="home.martello.devP2">For a long time, I tried to reach that feeling with samples, but it never really worked for me.</p>\n            <p data-i18n="home.martello.devP3">Over time, the idea started moving more clearly toward synthesized drums, using resonators and physical approaches rather than relying only on samples.</p>\n            <p data-i18n="home.martello.devP4">That direction became the foundation of Martello: a focused drum instrument made to feel immediate, responsive, and alive. While I was also working on a much more complex instrument, Martello naturally became something more direct, simple to understand, quick to use, and centered on sound.</p>\n            <p data-i18n="home.martello.devP5">The interface follows the same idea: no complicated submenus, with the main controls visible and ready to shape. Martello is built around limitations, but in a creative way, giving artists a starting point to design their own drum kits and then place them inside their own effects, space, and workflow.</p>'
  ],
  [
    '<p class="story-index"><span>Field test</span><span>P.A. pressure</span></p>\n          <h2 id="pa-test-title" class="story-moment-title">Martello under real speaker pressure.</h2>',
    '<p class="story-index"><span data-i18n="home.martello.fieldIndex">Field test</span><span data-i18n="home.martello.fieldPressure">P.A. pressure</span></p>\n          <h2 id="pa-test-title" class="story-moment-title" data-i18n="home.martello.fieldTitle">Martello under real speaker pressure.</h2>'
  ],
  [
    'aria-label="Martello drum synthesis P.A. field test footage"',
    'aria-label="Martello drum synthesis P.A. field test footage" data-i18n-aria="home.martello.fieldVideoAria"'
  ],
  [
    '<div class="plugin-story" data-product-only="galleria" aria-label="Galleria product story">',
    '<div class="plugin-story" data-product-only="galleria" aria-label="Galleria product story" data-i18n-aria="home.galleria.storyAria">'
  ],
  [
    '<h2 id="galleria-intro-title" class="story-chapter-title">Walk the gallery.</h2>\n            <p class="story-chapter-lede">Immersive spatial processing built around bright hall reflections, hybrid delay, and motion-driven 3D placement.</p>\n            <p class="story-open-body">Galleria is a spectral gallery reverb  -  not a static room preset. Shape space, delay, orbit, and texture in one focused panel, from dry public architecture to long tails that move through the field.</p>',
    '<h2 id="galleria-intro-title" class="story-chapter-title" data-i18n="home.galleria.introTitle">Walk the gallery.</h2>\n            <p class="story-chapter-lede" data-i18n="home.galleria.introLede">Immersive spatial processing built around bright hall reflections, hybrid delay, and motion-driven 3D placement.</p>\n            <p class="story-open-body" data-i18n="home.galleria.introBody">Galleria is a spectral gallery reverb  -  not a static room preset. Shape space, delay, orbit, and texture in one focused panel, from dry public architecture to long tails that move through the field.</p>'
  ],
  [
    '<section class="story-statement-band" aria-label="Galleria philosophy">',
    '<section class="story-statement-band" aria-label="Galleria philosophy" data-i18n-aria="home.galleria.philosophyAria">'
  ],
  [
    '<p>Galleria is a spatial instrument where reflections, delay, and motion are composed together  -  bright, smooth, and deliberately placed.</p>',
    '<p data-i18n="home.galleria.statement">Galleria is a spatial instrument where reflections, delay, and motion are composed together  -  bright, smooth, and deliberately placed.</p>'
  ],
  [
    '<div class="story-band container" aria-label="Core capabilities">\n        <ul class="story-band-list">\n          <li><span class="story-band-key">Space</span><span class="story-band-val">Reverb engine</span></li>\n          <li><span class="story-band-key">Delay</span><span class="story-band-val">Hybrid, sync, ping-pong</span></li>\n          <li><span class="story-band-key">Motion</span><span class="story-band-val">3D orbit + drift</span></li>\n          <li><span class="story-band-key">Texture</span><span class="story-band-val">Chorus + diffusion</span></li>\n        </ul>\n      </div>',
    '<div class="story-band container" aria-label="Core capabilities" data-i18n-aria="home.galleria.capabilitiesAria">\n        <ul class="story-band-list">\n          <li><span class="story-band-key" data-i18n="home.galleria.bandSpace">Space</span><span class="story-band-val" data-i18n="home.galleria.bandSpaceVal">Reverb engine</span></li>\n          <li><span class="story-band-key" data-i18n="home.galleria.bandDelay">Delay</span><span class="story-band-val" data-i18n="home.galleria.bandDelayVal">Hybrid, sync, ping-pong</span></li>\n          <li><span class="story-band-key" data-i18n="home.galleria.bandMotion">Motion</span><span class="story-band-val" data-i18n="home.galleria.bandMotionVal">3D orbit + drift</span></li>\n          <li><span class="story-band-key" data-i18n="home.galleria.bandTexture">Texture</span><span class="story-band-val" data-i18n="home.galleria.bandTextureVal">Chorus + diffusion</span></li>\n        </ul>\n      </div>'
  ],
  [
    '<p class="story-index"><span>Spatial engine</span></p>\n          <h3 id="galleria-space-title" class="story-moment-title">Public space, sculpted tail.</h3>\n          <p class="story-moment-body">Classic and spatial reverb modes with independent early/late balance, density, and diffusion. Filter the space, freeze the tail, and push reflections into motion without losing clarity.</p>',
    '<p class="story-index"><span data-i18n="home.galleria.spaceIndex">Spatial engine</span></p>\n          <h3 id="galleria-space-title" class="story-moment-title" data-i18n="home.galleria.spaceTitle">Public space, sculpted tail.</h3>\n          <p class="story-moment-body" data-i18n="home.galleria.spaceBody">Classic and spatial reverb modes with independent early/late balance, density, and diffusion. Filter the space, freeze the tail, and push reflections into motion without losing clarity.</p>'
  ],
  [
    '<p class="story-index"><span>3D motion</span></p>\n          <h3 id="galleria-motion-title" class="story-moment-title">Place the source. Move the field.</h3>\n          <p class="story-moment-body">Source X/Y/Z placement, orbit rate and depth, width, doppler, occlusion, and air  -  with a live spatial radar for performance-led positioning. Delay and space follow the same motion logic for cohesive immersion.</p>',
    '<p class="story-index"><span data-i18n="home.galleria.motionIndex">3D motion</span></p>\n          <h3 id="galleria-motion-title" class="story-moment-title" data-i18n="home.galleria.motionTitle">Place the source. Move the field.</h3>\n          <p class="story-moment-body" data-i18n="home.galleria.motionBody">Source X/Y/Z placement, orbit rate and depth, width, doppler, occlusion, and air  -  with a live spatial radar for performance-led positioning. Delay and space follow the same motion logic for cohesive immersion.</p>'
  ],
  [
    '<div class="plugin-story" data-product-only="membrana" aria-label="Membrana product story">',
    '<div class="plugin-story" data-product-only="membrana" aria-label="Membrana product story" data-i18n-aria="home.membrana.storyAria">'
  ],
  [
    '<h2 id="membrana-intro-title" class="story-chapter-title">Strike, resonate, shape.</h2>\n            <p class="story-chapter-lede">Three synthesis models for membranes, bodies, and tuned percussion  -  each built around exciter physics, resonator geometry, and a dedicated pitch computer.</p>\n            <p class="story-open-body">Membrana is a physical synthesizer, not a sample player. Choose Legacy Elements for classic membrane character, Modern Modal for resonant body shaping, or Pipe Engine for blown and struck air columns  -  then shape strike, resonance, and pitch in one focused instrument.</p>',
    '<h2 id="membrana-intro-title" class="story-chapter-title" data-i18n="home.membrana.introTitle">Strike, resonate, shape.</h2>\n            <p class="story-chapter-lede" data-i18n="home.membrana.introLede">Three synthesis models for membranes, bodies, and tuned percussion  -  each built around exciter physics, resonator geometry, and a dedicated pitch computer.</p>\n            <p class="story-open-body" data-i18n="home.membrana.introBody">Membrana is a physical synthesizer, not a sample player. Choose Legacy Elements for classic membrane character, Modern Modal for resonant body shaping, or Pipe Engine for blown and struck air columns  -  then shape strike, resonance, and pitch in one focused instrument.</p>'
  ],
  [
    '<section class="story-statement-band" aria-label="Membrana philosophy">',
    '<section class="story-statement-band" aria-label="Membrana philosophy" data-i18n-aria="home.membrana.philosophyAria">'
  ],
  [
    '<p>One instrument, three engines  -  from vintage membrane strike to modal body tone and pipe-resonator breath.</p>',
    '<p data-i18n="home.membrana.statement">One instrument, three engines  -  from vintage membrane strike to modal body tone and pipe-resonator breath.</p>'
  ],
  [
    '<div class="story-band container" aria-label="Synthesis models">\n        <ul class="story-band-list">\n          <li><span class="story-band-key">Legacy Elements</span><span class="story-band-val">Classic membrane strike</span></li>\n          <li><span class="story-band-key">Modern Modal</span><span class="story-band-val">Resonant body geometry</span></li>\n          <li><span class="story-band-key">Pipe Engine</span><span class="story-band-val">Blown + struck air columns</span></li>\n        </ul>\n      </div>',
    '<div class="story-band container" aria-label="Synthesis models" data-i18n-aria="home.membrana.modelsAria">\n        <ul class="story-band-list">\n          <li><span class="story-band-key">Legacy Elements</span><span class="story-band-val" data-i18n="home.membrana.bandLegacyVal">Classic membrane strike</span></li>\n          <li><span class="story-band-key">Modern Modal</span><span class="story-band-val" data-i18n="home.membrana.bandModalVal">Resonant body geometry</span></li>\n          <li><span class="story-band-key">Pipe Engine</span><span class="story-band-val" data-i18n="home.membrana.bandPipeVal">Blown + struck air columns</span></li>\n        </ul>\n      </div>'
  ],
  [
    '<h3 id="membrana-legacy-title" class="story-moment-title">Vintage strike, physical decay.</h3>\n          <p class="story-moment-body">Classic struck and blown membrane elements  -  skin tension, body knock, and the raw attack of physical instruments distilled into playable synthesis. Shape contour, damping, and decay for drums, skins, and tuned percussion with analog-era attitude.</p>',
    '<h3 id="membrana-legacy-title" class="story-moment-title" data-i18n="home.membrana.legacyTitle">Vintage strike, physical decay.</h3>\n          <p class="story-moment-body" data-i18n="home.membrana.legacyBody">Classic struck and blown membrane elements  -  skin tension, body knock, and the raw attack of physical instruments distilled into playable synthesis. Shape contour, damping, and decay for drums, skins, and tuned percussion with analog-era attitude.</p>'
  ],
  [
    '<h3 id="membrana-modal-title" class="story-moment-title">Shape the modes. Tune the body.</h3>\n          <p class="story-moment-body">Modal resonator modeling for membranes, plates, and vibrating bodies. Sculpt overtone structure, geometry, and damping with surgical control  -  from dry, focused strike to evolving harmonic bloom and long, singing decay.</p>',
    '<h3 id="membrana-modal-title" class="story-moment-title" data-i18n="home.membrana.modalTitle">Shape the modes. Tune the body.</h3>\n          <p class="story-moment-body" data-i18n="home.membrana.modalBody">Modal resonator modeling for membranes, plates, and vibrating bodies. Sculpt overtone structure, geometry, and damping with surgical control  -  from dry, focused strike to evolving harmonic bloom and long, singing decay.</p>'
  ],
  [
    '<h3 id="membrana-pipe-title" class="story-moment-title">Bore, breath, and column resonance.</h3>\n          <p class="story-moment-body">Tube and pipe resonator physics for blown and struck air columns. Organ tones, flutes, and hybrid pitched percussion with breath pressure, bore character, and the standing-wave resonance of a physical column  -  all driven through the same exciter and pitch computer.</p>',
    '<h3 id="membrana-pipe-title" class="story-moment-title" data-i18n="home.membrana.pipeTitle">Bore, breath, and column resonance.</h3>\n          <p class="story-moment-body" data-i18n="home.membrana.pipeBody">Tube and pipe resonator physics for blown and struck air columns. Organ tones, flutes, and hybrid pitched percussion with breath pressure, bore character, and the standing-wave resonance of a physical column  -  all driven through the same exciter and pitch computer.</p>'
  ],
  [
    '<p class="story-index"><span>Listen</span><span>SoundCloud</span></p>\n            <h2 id="membrana-audio-title" class="story-chapter-title">Hear Membrana in context.</h2>',
    '<p class="story-index"><span data-i18n="home.membrana.listenLabel">Listen</span><span>SoundCloud</span></p>\n            <h2 id="membrana-audio-title" class="story-chapter-title" data-i18n="home.membrana.audioTitle">Hear Membrana in context.</h2>'
  ],
  [
    '<h3 class="story-moment-title">To Zanarkand  -  two Membrana voices</h3>\n              <p class="story-moment-body soundcloud-feature-lede">Nobuo Uematsu  -  <cite>To Zanarkand</cite> arranged with two Membrana voices and Galleria spatial FX  -  membrane strike, modal body tone, and sculpted hall space in one piece.</p>',
    '<h3 class="story-moment-title" data-i18n="home.membrana.audioCardTitle">To Zanarkand  -  two Membrana voices</h3>\n              <p class="story-moment-body soundcloud-feature-lede" data-i18n="home.membrana.audioLede" data-i18n-html>Nobuo Uematsu  -  <cite>To Zanarkand</cite> arranged with two Membrana voices and Galleria spatial FX  -  membrane strike, modal body tone, and sculpted hall space in one piece.</p>'
  ],
  [
    'Open on SoundCloud\n              </a>\n            </div>\n            <div class="soundcloud-embed-wrap">\n              <iframe\n                class="soundcloud-embed"\n                title="Nobuo Uematsu  -  To Zanarkand: two Membrana voices with Galleria FX"',
    '<span data-i18n="home.membrana.audioLink">Open on SoundCloud</span>\n              </a>\n            </div>\n            <div class="soundcloud-embed-wrap">\n              <iframe\n                class="soundcloud-embed"\n                title="Nobuo Uematsu  -  To Zanarkand: two Membrana voices with Galleria FX" data-i18n-title="home.membrana.audioIframeTitle"'
  ],
  [
    '<h2 id="social-title" class="social-title">Follow us on social</h2>\n        <nav class="social-nav" aria-label="Social media">',
    '<h2 id="social-title" class="social-title" data-i18n="social.title">Follow us on social</h2>\n        <nav class="social-nav" aria-label="Social media" data-i18n-aria="social.navAria">'
  ],
  [
    `<p class="footer-copy">© <span id="year"></span> MontroneDSP. MontroneDSP is a registered trademark.</p>
        <nav class="footer-nav" aria-label="Footer navigation">
          <a href="https://store.montronedsp.com/" target="_blank" rel="noopener noreferrer">Store</a>
          <a href="dawless.html">DAWLESS</a>
          <a href="contact.html">Contact</a>
          <a href="free.html">Free</a>
          <a href="privacy.html">Privacy</a>
        </nav>`,
    `<p class="footer-copy" data-i18n="footer.copy">© {year} MontroneDSP. MontroneDSP is a registered trademark.</p>
        <nav class="footer-nav" aria-label="Footer navigation" data-i18n-aria="footer.navAria">
          <a href="https://store.montronedsp.com/" target="_blank" rel="noopener noreferrer" data-i18n="footer.store">Store</a>
          <a href="dawless.html" data-i18n="footer.dawless">DAWLESS</a>
          <a href="contact.html" data-i18n="footer.contact">Contact</a>
          <a href="free.html" data-i18n="footer.free">Free</a>
          <a href="privacy.html" data-i18n="footer.privacy">Privacy</a>
        </nav>`
  ],
  [
    '<button type="button" class="product-wheel-backdrop" aria-label="Close product switcher" tabindex="-1"></button>\n    <div class="product-wheel-stage" role="dialog" aria-modal="true" aria-label="Switch product">',
    '<button type="button" class="product-wheel-backdrop" aria-label="Close product switcher" tabindex="-1" data-i18n-aria="wheel.closeAria"></button>\n    <div class="product-wheel-stage" role="dialog" aria-modal="true" aria-label="Switch product" data-i18n-aria="wheel.switchAria">'
  ],
  [
    'data-wheel-label="Drum Synthesizer">\n          <span class="product-wheel-segment-name">Martello</span>\n          <span class="product-wheel-segment-type">Drums</span>',
    'data-wheel-label="Drum Synthesizer">\n          <span class="product-wheel-segment-name">Martello</span>\n          <span class="product-wheel-segment-type" data-i18n="products.martello.short">Drums</span>'
  ],
  [
    'data-wheel-label="Physical Synthesizer">\n          <span class="product-wheel-segment-name">Membrana</span>\n          <span class="product-wheel-segment-type">Physical</span>',
    'data-wheel-label="Physical Synthesizer">\n          <span class="product-wheel-segment-name">Membrana</span>\n          <span class="product-wheel-segment-type" data-i18n="products.membrana.short">Physical</span>'
  ],
  [
    'data-wheel-label="Environmental Processor">\n          <span class="product-wheel-segment-name">Galleria</span>\n          <span class="product-wheel-segment-type">Space</span>',
    'data-wheel-label="Environmental Processor">\n          <span class="product-wheel-segment-name">Galleria</span>\n          <span class="product-wheel-segment-type" data-i18n="products.galleria.short">Space</span>'
  ],
  [
    '<p class="product-wheel-hub-kicker">Selected</p>\n        <p class="product-wheel-hub-name" data-wheel-hub-name>Martello</p>\n        <p class="product-wheel-hub-type" data-wheel-hub-type>Drum Synthesizer</p>\n      </div>\n      <p class="product-wheel-hint">Tap a product to switch</p>',
    '<p class="product-wheel-hub-kicker" data-i18n="wheel.selected">Selected</p>\n        <p class="product-wheel-hub-name" data-wheel-hub-name>Martello</p>\n        <p class="product-wheel-hub-type" data-wheel-hub-type>Drum Synthesizer</p>\n      </div>\n      <p class="product-wheel-hint" data-i18n="wheel.hint">Tap a product to switch</p>'
  ],
  [
    'aria-label="Open product switcher">\n    <span class="product-wheel-trigger-core" aria-hidden="true"></span>\n    <span class="product-wheel-trigger-name" data-wheel-trigger-name>Martello</span>\n    <span class="product-wheel-trigger-hint">Switch</span>\n  </button>\n  <script src="product-selector.js"></script>\n  <script src="script.js"></script>',
    'aria-label="Open product switcher" data-i18n-aria="wheel.openAria">\n    <span class="product-wheel-trigger-core" aria-hidden="true"></span>\n    <span class="product-wheel-trigger-name" data-wheel-trigger-name>Martello</span>\n    <span class="product-wheel-trigger-hint" data-i18n="wheel.switch">Switch</span>\n  </button>\n  <script src="i18n.js"></script>\n  <script src="product-selector.js"></script>\n  <script src="script.js"></script>'
  ]
];

let missing = 0;
for (const [fromRaw, toRaw] of reps) {
  const from = norm(fromRaw);
  const to = norm(toRaw);
  if (!html.includes(from)) {
    console.error('MISSING:\n' + fromRaw.slice(0, 120).replace(/\n/g, '\\n'));
    missing++;
    continue;
  }
  html = html.replace(from, to);
}

if (missing) {
  console.error('Failed replacements:', missing);
  process.exit(1);
}

fs.writeFileSync(file, html, 'utf8');
console.log('Patched index.html with', reps.length, 'replacements');
