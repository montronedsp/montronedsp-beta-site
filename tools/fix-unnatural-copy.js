import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function set(obj, dotted, value) {
  const parts = dotted.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (cur[last] === undefined) {
    throw new Error(`Missing key ${dotted}`);
  }
  cur[last] = value;
}

const fixes = {
  de: {
    'home.martello.introTitle': 'Für den Groove gebaut.',
    'home.martello.lead': 'Präzise Drum-Synthese mit der Attitude klassischer Drum Machines.',
    'home.galleria.spaceTitle': 'Öffentlicher Raum, geformter Reverb-Tail.',
    'home.galleria.lead':
      'Spektraler Gallery-Reverb: helle Reflexionen öffentlicher Räume und immersives Spatial Motion.',
    'home.galleria.motionTitle': 'Quelle platzieren. Feld bewegen.',
    'home.membrana.introTitle': 'Anschlagen, schwingen, formen.',
    'home.membrana.modalTitle': 'Modi formen. Korpus stimmen.',
    'home.membrana.pipeTitle': 'Bohrung, Atem und Säulenresonanz.',
    'social.title': 'Folge uns auf Social Media',
    'common.getNotified': 'Benachrichtigen lassen',
    'home.galleria.notify': 'Benachrichtigen lassen',
    'home.membrana.notify': 'Benachrichtigen lassen'
  },
  es: {
    'home.martello.introTitle': 'Nacida para el groove.',
    'home.martello.demoTitle': 'Pruébalo antes de comprarlo.',
    'home.martello.producersStatement':
      'Pensado para producers que quieren drums que se sientan tocados, afinados, empujados y esculpidos. No solo elegidos de una carpeta.',
    'home.martello.lead':
      'Síntesis drum precisa y directa, con actitud de máquina clásica.',
    'products.galleria.type': 'Procesador espacial',
    'home.galleria.lead':
      'Reverb gallery espectral: reflejos luminosos de espacio público y motion espacial inmersivo.',
    'home.membrana.pipeTitle': 'Tubo, aliento y resonancia de columna.'
  },
  fr: {
    'home.martello.introTitle': 'Faite pour le groove.',
    'home.galleria.spaceTitle': 'Espace public, traînée sculptée.',
    'common.getNotified': 'Être informé',
    'home.galleria.notify': 'Être informé',
    'home.membrana.notify': 'Être informé',
    'home.membrana.pipeTitle': 'Tube, souffle et résonance de colonne.',
    'dawless.lead':
      'Un environnement natif épuré pour les instruments et le DSP MontroneDSP.',
    'home.galleria.lead':
      "Reverb gallery spectrale : réflexions lumineuses d'espace public, motion spatial immersif."
  },
  it: {
    'products.galleria.type': 'Processore spaziale',
    'home.membrana.pipeTitle': 'Sezione, fiato e risonanza di colonna.',
    'dawless.lead':
      'Un ambiente nativo essenziale per gli strumenti e il DSP MontroneDSP.',
    'home.martello.fieldTitle': 'Martello sotto vera pressione di PA.'
  },
  ja: {
    'home.martello.introTitle': 'グルーヴのために生まれた。',
    'home.galleria.spaceTitle': '公共空間、削り出したテイル。'
  },
  ru: {
    'home.martello.introTitle': 'Создан для грува.',
    'home.galleria.spaceTitle': 'Публичное пространство — вылепленный хвост реверба.',
    'home.membrana.pipeTitle': 'Канал, дыхание, резонанс воздушного столба.',
    'products.membrana.type': 'Физическое моделирование',
    'products.membrana.short': 'Физмодель'
  },
  uk: {
    'home.martello.introTitle': 'Створений для груву.',
    'home.galleria.spaceTitle': 'Публічний простір — виліплений хвіст ревербу.',
    'home.membrana.pipeTitle': 'Канал, дихання, резонанс повітряного стовпа.',
    'products.membrana.type': 'Фізичне моделювання',
    'products.membrana.short': 'Фізмодель',
    'dawless.lead':
      'Сфокусоване нативне середовище для інструментів і DSP MontroneDSP.'
  },
  'zh-CN': {
    // keep introTitle; only light polish on galleria lead punctuation
    'home.galleria.lead':
      '频谱画廊混响：明亮的公共空间反射，沉浸式空间运动。'
  }
};

for (const [code, map] of Object.entries(fixes)) {
  const file = path.join(root, 'locales', `${code}.json`);
  const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [key, value] of Object.entries(map)) {
    set(obj, key, value);
    console.log(`${code}  ${key}  →  ${value}`);
  }
  fs.writeFileSync(file, `${JSON.stringify(obj, null, 2)}\n`, 'utf8');
}

console.log('Done.');
