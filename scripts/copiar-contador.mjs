// After `npm run build:externa`: stores the current counter next to the page,
// so if the external source (GitHub Pages) can't be reached, visitors see the
// figure from upload time instead of nothing. Failure here never breaks the build.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist-externa/data/contador.json');

async function urlDelContador() {
  if (process.env.VITE_CONTADOR_URL) return process.env.VITE_CONTADOR_URL;
  const env = await readFile(join(ROOT, '.env.externa'), 'utf8').catch(() => '');
  return /^VITE_CONTADOR_URL=(.+)$/m.exec(env)?.[1].trim();
}

try {
  const url = await urlDelContador();
  if (!/^https?:\/\//.test(url ?? '')) throw new Error('sin VITE_CONTADOR_URL externa');
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (typeof data.correos !== 'number') throw new Error('respuesta sin cifra');
  await writeFile(OUT, JSON.stringify({ correos: data.correos, actualizado: data.actualizado ?? null }, null, 1) + '\n');
  console.log(`Copia de respaldo del contador: ${data.correos} correos`);
} catch (err) {
  console.warn(`No se pudo copiar el contador actual (${err.message}); se queda el del repo.`);
}
