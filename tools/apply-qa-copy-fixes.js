import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function get(obj, dotted) {
  return dotted.split('.').reduce((a, k) => (a == null ? a : a[k]), obj);
}

function set(obj, dotted, value) {
  const parts = dotted.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null || typeof cur[parts[i]] !== 'object') {
      throw new Error(`Missing parent for ${dotted}`);
    }
    cur = cur[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (cur[last] === undefined) throw new Error(`Missing key ${dotted}`);
  cur[last] = value;
}

/** @type {Record<string, Record<string, string>>} */
const fixes = {
  it: {
    'home.galleria.lead':
      'Riverbero da galleria spettrale: riflessioni luminose di spazi pubblici e movimento spaziale immersivo.',
    'home.galleria.introBody':
      "Galleria è un riverbero da galleria spettrale, non un preset di stanza statico. Modella spazio, delay, orbita e texture da un solo pannello: dall'architettura pubblica secca a code di riverbero che scintillano e si muovono nel campo.",
    'home.membrana.legacyBody':
      'Elementi a membrana classici, colpiti e soffiati: tensione della pelle, colpo del corpo e attacco grezzo degli strumenti fisici, distillati in sintesi suonabile. Contorno, smorzamento e decadimento per drum, pelli e percussioni accordate, con carattere da era analogica.',
    'home.membrana.modalBody':
      'Modellazione a risonatore modale per membrane, piastre e corpi in vibrazione. Scolpisci la struttura degli armonici, la geometria e lo smorzamento con controllo preciso: dallo strike secco e mirato al fiorire armonico e a decadimenti lunghi che cantano.',
    'home.martello.devP4':
      'Quella direzione è diventata la base di Martello: uno strumento drum essenziale, immediato, reattivo, vivo. Mentre lavoravo anche a un instrument molto più complesso, Martello è diventato naturalmente qualcosa di più diretto: semplice da capire, veloce da usare, centrato sul suono.',
    'dawless.conceptP3':
      "DAWLESS non vuole sostituire ogni DAW. È un ambiente creativo mirato in cui puoi iniziare, comporre, sequenziare, registrare e dare forma alle idee con meno ostacoli, poi portare avanti il lavoro quando è il momento.",
    'dawless.nativeP2':
      'I motori sonori sono scritti a mano: processori e strumenti sviluppati internamente per questo ambiente, senza dipendere da un host di terze parti o da un framework già pronto.',
    'privacy.h1p2':
      '<strong>MontroneDSP / Andrea Montrone</strong><br />Italia<br />Contatto: <a href="mailto:support@montronedsp.com">support@montronedsp.com</a>',
    'contact.responseBody':
      'Di solito rispondiamo entro pochi giorni lavorativi. Le questioni tecniche più complesse possono richiedere più tempo mentre approfondiamo il caso.',
    'products.membrana.short': 'Fisico'
  },
  de: {
    'meta.ogDescription':
      'Präzise Drum-Synthese mit der Attitude klassischer Drum Machines. Martello und MartelloX2 sind synthetische Drum-Instrumente für Mac VST3/AU, Windows VST3 und Linux VST3.',
    'home.galleria.statement':
      'Galleria ist ein Spatial-Instrument, in dem Reflexionen, Delay und Motion zusammen komponiert werden — hell, weich und bewusst platziert.',
    'nav.free': 'Kostenlos',
    'footer.free': 'Kostenlos',
    'products.galleria.type': 'Raumprozessor',
    'products.membrana.type': 'Physikalischer Synthesizer',
    'common.getNotified': 'Benachrichtigung erhalten',
    'home.galleria.notify': 'Benachrichtigung erhalten',
    'home.membrana.notify': 'Benachrichtigung erhalten',
    'dawless.statusEarly': 'Frühkunden'
  },
  es: {
    'home.galleria.lead':
      'Reverb de galería espectral: reflejos luminosos de espacios públicos y movimiento espacial inmersivo.',
    'privacy.h1p3':
      'Para preguntas de privacidad, solicitudes de corrección, eliminación o cualquier otra petición relacionada con datos, escríbenos a la dirección de correo anterior.',
    'privacy.h13': '13. Sin elaboración automatizada de perfiles',
    'dawless.nativeP2':
      'Los motores de sonido están escritos a mano: procesadores e instrumentos desarrollados internamente para este entorno, sin depender de un host de terceros o de un framework ya hecho.',
    'home.martello.capabilitiesAria': 'Funciones principales',
    'products.membrana.short': 'Físico'
  },
  fr: {
    'home.galleria.spaceTitle': 'Espace public, queue de réverb sculptée.',
    'home.galleria.lead':
      "Réverb de galerie spectrale : réflexions lumineuses d'espaces publics, mouvement spatial immersif.",
    'contact.responseBody':
      "Nous répondons en général sous quelques jours ouvrés. Les questions techniques complexes peuvent prendre plus de temps le temps de l'analyse.",
    'dawless.exportP2':
      "Le passage d'une session DAWLESS concentrée à un mix et un master professionnels est conçu pour être direct et sans douleur. Commencez ici. Terminez là où votre processus l'exige.",
    'dawless.nativeP2':
      "Les moteurs sonores sont écrits à la main : processeurs et instruments développés en interne pour cet environnement, sans dépendre d'un host tiers ou d'un framework tout prêt.",
    'home.martello.devP2':
      "Longtemps, j'ai cherché cette sensation avec des samples. Ça n'a jamais vraiment fonctionné pour moi.",
    'common.getNotified': 'Recevoir une alerte',
    'home.galleria.notify': 'Recevoir une alerte',
    'home.membrana.notify': 'Recevoir une alerte',
    'products.membrana.short': 'Physique'
  },
  ja: {
    'home.martello.audioCardTitle': 'ドライエンジン録音と楽曲デモ',
    'home.membrana.audioTitle': 'Membranaの音を聴く。',
    'social.title': 'SNSでフォロー',
    'free.requestAccess': '利用を申し込む',
    'home.martello.fieldPressure': 'PAの音圧',
    'home.galleria.statement':
      'Galleriaは、反射・ディレイ・モーションを一体で組む空間楽器——明るく、滑らかで、意図して配置される。'
  },
  'zh-CN': {
    'privacy.h2li3': 'MIDI 音型',
    'home.membrana.audioTitle': '听 Membrana 的实际编曲示例。',
    'common.getNotified': '上线提醒',
    'home.membrana.notify': '上线提醒',
    'home.galleria.notify': '上线提醒',
    'home.galleria.bandTextureVal': 'Chorus＋扩散',
    'home.martello.modelTitle': '每个声部，自选物理模型。',
    'home.galleria.statement':
      'Galleria 是一件空间乐器，反射、延迟与运动被一并编排——明亮、顺滑、精心定位。',
    'contact.lead':
      '关于 Martello、授权、安装或订单的问题？发邮件给我们，我们会尽快回复。'
  },
  ru: {
    'home.heroAria': 'Главный блок продукта',
    'modi.heroAria': 'Архивный промоблок Modi',
    'free.meta.title': 'Бесплатные утилиты | MontroneDSP',
    'free.meta.ogTitle': 'Бесплатные утилиты | MontroneDSP',
    'free.sectionAria': 'Бесплатные утилиты',
    'free.eyebrowTools': 'Утилиты',
    'wheel.hint': 'Нажмите на продукт, чтобы переключить',
    'modi.title':
      'На этой странице сохранена ранняя версия бесплатного раздела с акцентом на Modi.',
    'home.martello.producersStatement':
      'Для тех, кому нужны ударные, которые ощущаются сыгранными, настроенными, с драйвом и вылепленными — а не выбранными из папки.',
    'dawless.conceptP3':
      'DAWLESS не призван заменить любую DAW. Это сфокусированная творческая среда, где можно начинать, сочинять, секвенсировать, записывать и формировать идеи без лишних помех  -  а затем двигаться дальше, когда придёт время.'
  },
  uk: {
    'dawless.meta.ogDescription':
      'Сфокусоване нативне середовище для інструментів і DSP MontroneDSP. Експериментальний проєкт для ранніх клієнтів.',
    'home.heroAria': 'Головний блок продукту',
    'modi.heroAria': 'Архівний промоблок Modi',
    'free.meta.title': 'Безкоштовні утиліти | MontroneDSP',
    'free.meta.ogTitle': 'Безкоштовні утиліти | MontroneDSP',
    'free.sectionAria': 'Безкоштовні утиліти',
    'free.eyebrowTools': 'Утиліти',
    'modi.title':
      'На цій сторінці збережено ранню версію безкоштовного розділу з акцентом на Modi.',
    'home.martello.producersStatement':
      'Для тих, кому потрібні ударні, що відчуваються зіграними, налаштованими, з драйвом і виліпленими — а не вибраними з папки.',
    'dawless.conceptP3':
      'DAWLESS не покликаний замінити будь-яку DAW. Це сфокусоване творче середовище, де можна починати, писати, секвенсувати, записувати й формувати ідеї без зайвих перешкод  -  а потім рухатися далі, коли настане час.',
    'home.membrana.modalTitle': 'Формуйте моди. Налаштовуйте корпус.'
  }
};

// Special cases that need reading current and patching substrings / full known strings
function patchSpecial(code, obj) {
  if (code === 'it') {
    // fix exportP1 mixer engineer phrase if present
    if (obj.dawless?.exportP1?.includes('mastering engineer')) {
      obj.dawless.exportP1 = obj.dawless.exportP1
        .replace('un mixer o a un mastering engineer', 'un fonico di mix o a un mastering engineer')
        .replace('conservare le registrazioni', 'conservare la documentazione');
    }
    if (obj.privacy?.h4p3?.includes('registrazioni aziendali')) {
      obj.privacy.h4p3 = obj.privacy.h4p3.replace(
        'conservare le registrazioni aziendali',
        'conservare la documentazione aziendale'
      );
    }
    if (obj.privacy?.h10li1?.includes('registrazioni aziendali')) {
      obj.privacy.h10li1 = obj.privacy.h10li1.replace(
        'tenuta delle registrazioni aziendali',
        'conservazione della documentazione aziendale'
      );
    }
    // fix instrument leftover in devP4 if we overwrote partially - read en length
    // Already set full string in fixes; also fix "instrument" in case old string remains elsewhere
    if (obj.home?.martello?.devP4?.includes('un instrument ')) {
      obj.home.martello.devP4 = obj.home.martello.devP4.replace('un instrument ', 'uno strumento ');
    }
  }

  if (code === 'de') {
    const mb = obj.home?.membrana?.modalBody;
    if (mb?.includes('blossendem')) {
      obj.home.membrana.modalBody = mb.replace('blossendem', 'aufblühendem');
    }
    if (obj.home?.galleria?.introBody) {
      obj.home.galleria.introBody = obj.home.galleria.introBody
        .replace('Public Architecture', 'öffentlicher Architektur')
        .replace('durchs Field bewegen', 'durchs Raumfeld bewegen')
        .replace('schimmernden Tails', 'schimmernden Reverb-Tails');
    }
    if (obj.home?.galleria?.spaceBody) {
      obj.home.galleria.spaceBody = obj.home.galleria.spaceBody
        .replace('Space filtern, Tail freezen und Reflections in Motion bringen', 'Den Raum filtern, den Tail einfrieren und Reflexionen in Bewegung bringen')
        .replace('Space filtern', 'Den Raum filtern');
    }
    if (obj.home?.martello?.introBody?.includes('Design Kick')) {
      obj.home.martello.introBody = obj.home.martello.introBody.replace('Design Kick', 'Gestalte Kick');
    }
    if (obj.demo?.downloadsIntro?.includes('Zustimmung zur')) {
      obj.demo.downloadsIntro = obj.demo.downloadsIntro.replace(
        'setzt die Zustimmung zur <a href="#martello-eula">End User License Agreement</a> unten voraus.',
        'setzt die Zustimmung zum unten stehenden <a href="#martello-eula">End User License Agreement</a> voraus.'
      );
    }
    if (obj.home?.membrana?.audioLede) {
      obj.home.membrana.audioLede = obj.home.membrana.audioLede
        .replace('skulptierter Hallraum in einem Piece', 'geformter Hall in einem Stück');
    }
  }

  if (code === 'es') {
    // accents and leftovers
    const replaceMap = [
      [/percusion/g, 'percusión'],
      [/un instrument /g, 'un instrumento '],
      [/knock del cuerpo/g, 'golpe del cuerpo'],
      [/\bskins\b/g, 'parches'],
      [/handwritten:/g, 'escritos a mano:'],
      [/hardware-like/g, 'tipo hardware'],
      [/una pipeline de producción/g, 'una cadena de producción'],
      [/tenencia razonable de registros empresariales/g, 'conservación razonable de los registros comerciales']
    ];
    const walk = (node) => {
      if (typeof node === 'string') {
        let s = node;
        for (const [re, to] of replaceMap) s = s.replace(re, to);
        return s;
      }
      if (node && typeof node === 'object') {
        for (const k of Object.keys(node)) node[k] = walk(node[k]);
      }
      return node;
    };
    walk(obj);

    if (obj.home?.membrana?.legacyBody?.includes('actitud de era')) {
      obj.home.membrana.legacyBody = obj.home.membrana.legacyBody.replace(
        'con actitud de era analógica',
        'con carácter de era analógica'
      );
    }
    if (obj.dawless?.workflowOutro?.includes('handwritten')) {
      obj.dawless.workflowOutro = obj.dawless.workflowOutro.replace(/handwritten/g, 'escritos a mano');
    }
  }

  if (code === 'fr') {
    for (const key of ['macStep4', 'winStep5', 'linuxStep5']) {
      if (obj.demo?.[key]?.includes('rescanner')) {
        obj.demo[key] = obj.demo[key].replace('et rescanner les', 'et rescassez les');
      }
    }
    if (obj.home?.galleria?.introLede) {
      obj.home.galleria.introLede = obj.home.galleria.introLede
        .replace('delay hybrid', 'delay hybride')
        .replace('par le motion', 'par le mouvement');
    }
    if (obj.free?.toolBody?.includes('delivery')) {
      obj.free.toolBody = obj.free.toolBody.replace('et la delivery', 'et la livraison');
    }
    if (obj.free?.toolLi3?.includes('delivery')) {
      obj.free.toolLi3 = obj.free.toolLi3.replace(/delivery/gi, 'livraison');
    }
    // licensing → licences in privacy
    const privWalk = (node, p = '') => {
      if (typeof node === 'string' && node.includes('licensing')) {
        return node.replace(/licensing/g, 'licences');
      }
      if (node && typeof node === 'object') {
        for (const k of Object.keys(node)) node[k] = privWalk(node[k], `${p}.${k}`);
      }
      return node;
    };
    if (obj.privacy) privWalk(obj.privacy);
  }

  if (code === 'ja') {
    if (obj.home?.martello?.validationP1?.includes('ミュージカル')) {
      obj.home.martello.validationP1 = obj.home.martello.validationP1.replace(
        '人間によるミュージカルテスト',
        '実楽曲での試聴検証'
      );
    }
    if (obj.home?.martello?.audioLede?.includes('文脈')) {
      obj.home.martello.audioLede =
        'Martelloのボイス、モデル、ドラムのキャラクターを実際のサウンドで——エンジンから生まれるシンセのキック、スネア、ハット、チューンド・パーカッション。';
    }
    if (obj.home?.membrana?.lead?.includes('レゾネーター幾何')) {
      obj.home.membrana.lead = obj.home.membrana.lead.replace('レゾネーター幾何', 'レゾネーターのジオメトリ');
      obj.home.membrana.lead = obj.home.membrana.lead.replace('エキサイター物理', 'エキサイターの物理');
    }
    if (obj.home?.membrana?.bandModalVal?.includes('幾何')) {
      obj.home.membrana.bandModalVal = obj.home.membrana.bandModalVal.replace('幾何', 'ジオメトリ');
    }
    if (obj.home?.galleria?.lead?.includes('没入する')) {
      obj.home.galleria.lead = obj.home.galleria.lead.replace(
        '没入する空間モーションを持つ',
        '没入感のある空間モーションを備えた'
      );
    }
  }

  if (code === 'zh-CN') {
    if (obj.meta?.title?.includes('鼓合成')) {
      obj.meta.title = obj.meta.title.replace('鼓合成与实验声音', '合成鼓与实验声音');
    }
    if (obj.home?.martello?.audioLede?.includes('在语境中')) {
      obj.home.martello.audioLede = obj.home.martello.audioLede.replace(
        '在语境中听',
        '结合实际编曲听'
      );
    }
    if (obj.home?.martello?.validationP2?.includes('预设召回')) {
      obj.home.martello.validationP2 = obj.home.martello.validationP2.replace('预设召回', '预设还原');
    }
    if (obj.free?.meta?.description) {
      // leave
    }
  }

  if (code === 'ru') {
    if (obj.home?.membrana?.legacyBody?.includes('сырой атака')) {
      obj.home.membrana.legacyBody = obj.home.membrana.legacyBody.replace('сырой атака', 'сырая атака');
    }
    if (obj.free?.meta?.description?.includes('аудиоинструменты')) {
      obj.free.meta.description = obj.free.meta.description.replace('аудиоинструменты', 'аудиоутилиты');
    }
    if (obj.home?.martello?.devP5?.includes('готовы к лепке')) {
      obj.home.martello.devP5 = obj.home.martello.devP5.replace(
        'готовы к лепке',
        'сразу под рукой'
      );
    }
    if (obj.home?.galleria?.lead?.includes('с яркими отражениями')) {
      obj.home.galleria.lead =
        'Спектральный gallery-реверб: яркие отражения общественных пространств и иммерсивное пространственное движение.';
    }
  }

  if (code === 'uk') {
    if (obj.home?.membrana?.legacyBody) {
      obj.home.membrana.legacyBody = obj.home.membrana.legacyBody
        .replace('сирий атака', 'сира атака')
        .replace('гральний синтез', 'виконуваний синтез');
    }
    if (obj.free?.meta?.description?.includes('аудіоінструменти')) {
      obj.free.meta.description = obj.free.meta.description.replace(
        'аудіоінструменти',
        'аудіоутиліти'
      );
    }
  }
}

let applied = 0;
let skipped = 0;
for (const [code, map] of Object.entries(fixes)) {
  const file = path.join(root, 'locales', `${code}.json`);
  const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [key, value] of Object.entries(map)) {
    try {
      const prev = get(obj, key);
      set(obj, key, value);
      applied++;
      console.log(`${code} ${key}`);
      if (prev === value) console.log('  (unchanged value)');
    } catch (e) {
      skipped++;
      console.warn(`SKIP ${code} ${key}: ${e.message}`);
    }
  }
  patchSpecial(code, obj);
  fs.writeFileSync(file, `${JSON.stringify(obj, null, 2)}\n`, 'utf8');
}

console.log(`Applied ${applied}, skipped ${skipped}`);
