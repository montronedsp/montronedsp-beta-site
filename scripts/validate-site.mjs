import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = process.cwd();
const sourceExtensions = new Set(['.css', '.html', '.js', '.json', '.mjs', '.txt', '.xml', '.yml']);
const excludedDirectories = new Set(['.git', 'assets', 'tools']);
const encodingProblem = /\uFFFD|\u00C2|\u00C3|\u00E2[\u0080-\u00BF]|\?{4,}/u;

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) files.push(...await collectFiles(join(directory, entry.name)));
    } else if (sourceExtensions.has(extname(entry.name))) {
      files.push(join(directory, entry.name));
    }
  }

  return files;
}

const localeDirectory = join(root, 'locales');
const localeFiles = (await readdir(localeDirectory)).filter((file) => file.endsWith('.json'));
for (const localeFile of localeFiles) {
  const filePath = join(localeDirectory, localeFile);
  JSON.parse((await readFile(filePath, 'utf8')).replace(/^\uFEFF/u, ''));
}

const sourceFiles = await collectFiles(root);
const failures = [];
for (const filePath of sourceFiles) {
  const contents = await readFile(filePath, 'utf8');
  if (encodingProblem.test(contents)) failures.push(filePath.slice(root.length + 1));
}

if (failures.length) {
  throw new Error(`Potential mojibake or replacement glyph found in: ${failures.join(', ')}`);
}

console.log(`Validated ${localeFiles.length} locale JSON files and ${sourceFiles.length} UTF-8 source files.`);
