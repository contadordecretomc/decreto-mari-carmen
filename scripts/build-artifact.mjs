// Builds artifact/index.html: the whole site as one self-contained file for the
// claude.ai Artifact viewer (its CSP blocks fetching sibling data/images).
//  - inlines the Vite bundle (JS + CSS)
//  - embeds diputados.json with every photo as a recompressed data: URI
//  - drops <!doctype>/<html>/<head>/<body>: the viewer adds its own skeleton
//
// Usage: npm run artifact   (runs `vite build` first)

import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'artifact/index.html');
const JPEG_QUALITY = '60';

// macOS `sips` shrinks the photos ~4x; elsewhere fall back to the originals.
async function photoDataUri(file, tmp) {
  let bytes;
  try {
    const out = join(tmp, 'p.jpg');
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', JPEG_QUALITY, file, '--out', out], {
      stdio: 'ignore',
    });
    bytes = await readFile(out);
  } catch {
    bytes = await readFile(file);
  }
  return `data:image/jpeg;base64,${bytes.toString('base64')}`;
}

async function main() {
  const html = await readFile(join(DIST, 'index.html'), 'utf8');
  const jsPath = html.match(/<script type="module"[^>]*src="\.\/([^"]+)"/)[1];
  const cssPath = html.match(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"/)[1];
  const js = await readFile(join(DIST, jsPath), 'utf8');
  const css = await readFile(join(DIST, cssPath), 'utf8');
  // The public site bundles its fonts; the artifact viewer can't load those
  // files, so this preview-only build pulls the same families from Google Fonts.
  const fonts =
    'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap';

  const data = JSON.parse(await readFile(join(ROOT, 'public/data/diputados.json'), 'utf8'));
  const tmp = await mkdtemp(join(tmpdir(), 'dmc-'));
  for (const d of data.diputados) {
    if (d.foto) d.foto = await photoDataUri(join(ROOT, 'public', d.foto), tmp);
  }
  await rm(tmp, { recursive: true });

  // `<` escaped so no string in the data can close the <script> early.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  // The artifact can't fetch the live counter, so it shows the value at build time.
  const contador = (await readFile(join(ROOT, 'public/data/contador.json'), 'utf8')).trim();

  const page = `<title>Decreto Mari Carmen</title>
<meta name="description" content="Escribe a tu diputado o diputada: que vote a favor de convalidar el Decreto Mari Carmen este viernes en el Congreso." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="${fonts}" />
<style>${css.replace(/@font-face\{[^}]*\}/g, '')}</style>
<div id="root"></div>
<script type="application/json" id="diputados-data">${json}</script>
<script type="application/json" id="contador-data">${contador}</script>
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>
`;

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, page);
  console.log(`OK → ${OUT} (${(Buffer.byteLength(page) / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
