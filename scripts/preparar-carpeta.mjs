// `npm run carpeta`: builds a folder ready to upload to any existing website.
//
//   carpeta/decretomaricarmen/      ← upload this folder as is
//   carpeta/decretomaricarmen.zip   ← the same, zipped
//
// It copies dist/, stores the current counter as the fallback copy and adds a
// LEEME.txt. The only file to edit after uploading is configuracion.json.

import { cp, rm, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOMBRE = 'decretomaricarmen';
const SALIDA = join(ROOT, 'carpeta');
const DEST = join(SALIDA, NOMBRE);
const CONTADOR_URL = 'https://contadordecretomc.github.io/decreto-mari-carmen/data/contador.json';

await rm(SALIDA, { recursive: true, force: true });
await mkdir(SALIDA, { recursive: true });
await cp(join(ROOT, 'dist'), DEST, { recursive: true });

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

1. Sube la carpeta «${NOMBRE}» entera a la carpeta pública de tu web
   (por ejemplo public_html/), por FTP o desde el panel del alojamiento.
   Quedará en https://tudominio/${NOMBRE}/  (funciona con y sin barra final).
   Si quieres otra dirección, basta con cambiarle el nombre a la carpeta.
   En WordPress: va al lado de wp-admin, wp-content y wp-config.php.
   La carpeta lleva un archivo oculto, .htaccess: asegúrate de subirlo también
   (lo más fácil es subir el .zip y descomprimirlo desde el panel del alojamiento).

2. Edita configuracion.json con cualquier editor de texto:
   - correoContacto: correo para consultas y solicitudes de datos.
   - organizacion: quien firma la campaña (déjalo "" si no firma nadie).
   Es el único archivo que hay que tocar.

3. Nada más. El contador de correos se lee automáticamente de GitHub Pages,
   que lo actualiza cada 10 minutos. data/contador.json es solo una copia de
   respaldo por si GitHub no respondiera.

Si tu servidor aplica una política de seguridad de contenidos (CSP), debe
permitir:
   connect-src https://contadordecretomc.github.io
   img-src     https://contadordecretomc.goatcounter.com
`
);

// Zip with no extra file attributes (no local user/owner metadata).
execFileSync('zip', ['-qrX', `${NOMBRE}.zip`, NOMBRE, '-x', '*.DS_Store'], { cwd: SALIDA });
console.log(`OK → carpeta/${NOMBRE}/ y carpeta/${NOMBRE}.zip`);
