// `npm run carpeta`: builds a folder ready to upload to any existing website
// (WordPress included) without touching anything on that server.
//
//   carpeta/decretomaricarmen/                              ← the folder
//   carpeta/decretomaricarmen.zip                           ← the same, zipped
//
// The page is renamed from index.html to PAGINA, so it can never clash with the
// host's own index files or server settings, and no .htaccess is shipped.
// Address: https://domain/decretomaricarmen/diputadosdecretomaricarmen.html
// The only file to edit after uploading is configuracion.json.

import { cp, rm, mkdir, rename, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOMBRE = 'decretomaricarmen';
const PAGINA = 'diputadosdecretomaricarmen.html';
const SALIDA = join(ROOT, 'carpeta');
const DEST = join(SALIDA, NOMBRE);
const campana = JSON.parse(await readFile(join(ROOT, 'campana.config.json'), 'utf8'));
const CONTADOR_URL = `${campana.githubPages}data/contador.json`;

await rm(SALIDA, { recursive: true, force: true });
await mkdir(SALIDA, { recursive: true });
await cp(join(ROOT, 'dist'), DEST, { recursive: true });

// All paths in the page are relative to its folder, so renaming it is safe.
await rename(join(DEST, 'index.html'), join(DEST, PAGINA));
// Server config files stay out: nothing in this folder changes how the host works.
await rm(join(DEST, '.htaccess'), { force: true });

// Fallback copy of the counter: the live figure right now.
try {
  const res = await fetch(CONTADOR_URL, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { correos, actualizado } = await res.json();
  if (typeof correos !== 'number') throw new Error('respuesta sin cifra');
  await writeFile(join(DEST, 'data/contador.json'), JSON.stringify({ correos, actualizado: actualizado ?? null }, null, 1) + '\n');
  console.log(`Copia de respaldo del contador: ${correos} correos`);
} catch (err) {
  console.warn(`No se pudo copiar el contador actual (${err.message}); se queda el de la compilación.`);
}

await writeFile(
  join(DEST, 'LEEME.txt'),
  `DECRETO MARI CARMEN · CÓMO PUBLICAR ESTA CARPETA
================================================

1. Sube el zip a la carpeta principal de tu web y descomprímelo ahí.
   En WordPress es la carpeta que contiene wp-admin, wp-content y
   wp-config.php (suele llamarse public_html, httpdocs o www).
   No se toca nada de WordPress ni del servidor.

2. Edita configuracion.json (dentro de esta carpeta) con cualquier editor:
   - correoContacto: correo para consultas y solicitudes de datos.
   - organizacion: quien firma la campaña (déjalo "" si no firma nadie).
   Es el único archivo que hay que tocar.

3. La web queda publicada en:
   https://tudominio/${NOMBRE}/${PAGINA}
   Esa es la dirección que hay que compartir.

El contador de correos se lee automáticamente de GitHub Pages, que lo
actualiza cada 10 minutos. data/contador.json es solo una copia de respaldo.
`
);

// Zip with no extra file attributes (no local user/owner metadata).
execFileSync('zip', ['-qrX', `${NOMBRE}.zip`, NOMBRE, '-x', '*.DS_Store'], { cwd: SALIDA });
console.log(`OK → carpeta/${NOMBRE}/${PAGINA} y carpeta/${NOMBRE}.zip`);
