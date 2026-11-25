// Sizzle & Serve — hand-in program (Node 22, standard library only).
//
// Copies game/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from
// vendor/makefun-game.ts. Outside the grader, MAKEFUN_OUTPUT_DIR
// stands in for /output. The program runs twice and must write the
// same bytes both times, so it copies deterministically and never
// deletes anything: the output directory is created only when missing.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

function countFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    n += statSync(p).isDirectory() ? countFiles(p) : 1;
  }
  return n;
}

let copied = 0;
for (const name of ['game', 'screenshots']) {
  const src = join(repoRoot, name);
  const dst = join(outDir, name);
  if (!existsSync(src)) throw new Error('missing in repository: ' + name + '/');
  cpSync(src, dst, { recursive: true, dereference: false, force: true });
  copied += countFiles(dst);
}

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
});
const dossierPath = join(outDir, 'dossier.json');
writeFileSync(dossierPath, dossier);

// Read the dossier back: a hand-in that cannot be read back is not a hand-in.
const check = JSON.parse(readFileSync(dossierPath, 'utf8'));
if (typeof check !== 'object' || check === null) throw new Error('dossier.json did not parse');

console.log('Sizzle & Serve handed in: ' + copied + ' files copied, dossier.json written (' + dossier.length + ' bytes).');
