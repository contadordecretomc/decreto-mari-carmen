// `npm run html-unico`: one self-contained page (JS and CSS inlined) to update a
// site that already has the campaign folder published (Lovable, FTP, WordPress
// folder). Only diputadosdecretomaricarmen.html is replaced; fonts, photos and
// data are still read from the folder already on the server, so they must not
// have changed (the script checks the font names against a previous package if
// one is given with --comparar <carpeta publicada>).
//
//   unico/diputadosdecretomaricarmen.html

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'unico/diputadosdecretomaricarmen.html');

let html = await readFile(join(DIST, 'index.html'), 'utf8');
const jsPath = html.match(/<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/);
const cssPath = html.match(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/);
if (!jsPath || !cssPath) throw new Error('No se encontraron el JS o el CSS en dist/index.html');

const js = await readFile(join(DIST, jsPath[1]), 'utf8');
// Font URLs are relative to assets/; once inlined in the page they must point there.
const css = (await readFile(join(DIST, cssPath[1]), 'utf8')).replace(/url\(\.\/([^)]+)\)/g, 'url(./assets/$1)');

html = html
  .replace(cssPath[0], () => `<style>${css}</style>`)
  .replace(jsPath[0], () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`);

const comparar = process.argv.indexOf('--comparar');
if (comparar > 0) {
  const publicadas = new Set(await readdir(join(process.argv[comparar + 1], 'assets')));
  const faltan = [...css.matchAll(/url\(\.\/assets\/([^)]+)\)/g)].map((m) => m[1]).filter((f) => !publicadas.has(f));
  if (faltan.length) throw new Error(`Estas fuentes no están en la carpeta publicada: ${faltan.join(', ')}`);
  console.log('Fuentes comprobadas: todas están en la carpeta publicada.');
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, html);
console.log(`OK → unico/diputadosdecretomaricarmen.html (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
