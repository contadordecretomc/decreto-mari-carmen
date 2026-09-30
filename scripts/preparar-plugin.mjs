// `npm run plugin`: packages the site as a WordPress plugin.
//
//   plugin/decreto-mari-carmen/        ← plugin folder (PHP + web/)
//   plugin/decreto-mari-carmen.zip     ← upload in Plugins → Add New → Upload Plugin
//
// The PHP lives in wordpress-plugin/; the built site goes into web/. Settings
// (contact email, organisation, address) are edited in the WordPress admin, so
// configuracion.json is left out.

import { cp, rm, mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOMBRE = 'decreto-mari-carmen';
const SALIDA = join(ROOT, 'plugin');
const DEST = join(SALIDA, NOMBRE);
const WEB = join(DEST, 'web');
const campana = JSON.parse(await readFile(join(ROOT, 'campana.config.json'), 'utf8'));
const CONTADOR_URL = `${campana.githubPages}data/contador.json`;

await rm(SALIDA, { recursive: true, force: true });
await mkdir(SALIDA, { recursive: true });
await cp(join(ROOT, 'wordpress-plugin'), DEST, { recursive: true });
await cp(join(ROOT, 'dist'), WEB, { recursive: true });

// Default contact email from campana.config.json (the PHP ships a placeholder).
const php = join(DEST, 'decreto-mari-carmen.php');
await writeFile(php, (await readFile(php, 'utf8')).replace('__CORREO_CONTACTO__', campana.correoContacto.replace(/'/g, '')));

// Settings come from the WordPress admin; server config files don't belong here.
for (const f of ['configuracion.json', '.htaccess']) await rm(join(WEB, f), { force: true });

// Fallback copy of the counter: the live figure right now.
try {
  const res = await fetch(CONTADOR_URL, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { correos, actualizado } = await res.json();
  if (typeof correos !== 'number') throw new Error('respuesta sin cifra');
  await writeFile(join(WEB, 'data/contador.json'), JSON.stringify({ correos, actualizado: actualizado ?? null }, null, 1) + '\n');
  console.log(`Copia de respaldo del contador: ${correos} correos`);
} catch (err) {
  console.warn(`No se pudo copiar el contador actual (${err.message}); se queda el de la compilación.`);
}

// Zip with no extra file attributes (no local user/owner metadata).
execFileSync('zip', ['-qrX', `${NOMBRE}.zip`, NOMBRE, '-x', '*.DS_Store'], { cwd: SALIDA });
console.log(`OK → plugin/${NOMBRE}.zip`);
