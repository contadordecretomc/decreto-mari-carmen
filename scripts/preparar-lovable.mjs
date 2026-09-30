// `npm run lovable`: package for a website built with lovable.dev (React + Vite).
//
//   lovable/decretomaricarmen-lovable/          ← mirrors the Lovable project root
//     public/decretomaricarmen/                 ← the campaign site (static files)
//     src/pages/DecretoMariCarmen.tsx           ← page for the short /decretomaricarmen route
//     LEEME.txt, PROMPT-PARA-LOVABLE.txt
//   lovable/decretomaricarmen-lovable.zip
//
// Files in a Vite project's public/ folder are published as is, so the campaign
// stays isolated from the host app (no shared CSS or code). Builds on the
// `npm run carpeta` output, which runs first.

import { cp, rm, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOMBRE = 'decretomaricarmen-lovable';
const SALIDA = join(ROOT, 'lovable');
const DEST = join(SALIDA, NOMBRE);
const PAGINA = '/decretomaricarmen/diputadosdecretomaricarmen.html';

await rm(SALIDA, { recursive: true, force: true });
await mkdir(join(DEST, 'src/pages'), { recursive: true });
await cp(join(ROOT, 'carpeta/decretomaricarmen'), join(DEST, 'public/decretomaricarmen'), { recursive: true });
// The FTP instructions don't apply here; LEEME.txt at the package root replaces them.
await rm(join(DEST, 'public/decretomaricarmen/LEEME.txt'), { force: true });

await writeFile(
  join(DEST, 'src/pages/DecretoMariCarmen.tsx'),
  `import { useEffect } from "react";

// Short address /decretomaricarmen → the campaign page, which lives as static
// files in public/decretomaricarmen/ (kept apart from this app's code and styles).
const PAGINA = "${PAGINA}";

const DecretoMariCarmen = () => {
  useEffect(() => {
    // Full page load (not a client-side route): the campaign is its own page.
    window.location.replace(PAGINA + window.location.hash);
  }, []);
  return null;
};

export default DecretoMariCarmen;
`
);

await writeFile(
  join(DEST, 'PROMPT-PARA-LOVABLE.txt'),
  `Copia y pega este texto en el chat de Lovable DESPUÉS de haber añadido los archivos al proyecto:

---
He añadido al proyecto la carpeta public/decretomaricarmen/ (una web estática independiente) y el archivo src/pages/DecretoMariCarmen.tsx. Por favor:
1. En src/App.tsx, importa DecretoMariCarmen desde "./pages/DecretoMariCarmen" y añade la ruta <Route path="/decretomaricarmen" element={<DecretoMariCarmen />} /> antes de la ruta comodín "*".
2. No modifiques nada dentro de public/decretomaricarmen/ ni el contenido de src/pages/DecretoMariCarmen.tsx.
3. No cambies nada más del proyecto.
---
`
);

await writeFile(
  join(DEST, 'LEEME.txt'),
  `DECRETO MARI CARMEN · PAQUETE PARA UNA WEB HECHA CON LOVABLE
=============================================================

Qué contiene (misma estructura que un proyecto de Lovable):
  public/decretomaricarmen/        La web de la campaña (archivos estáticos).
  src/pages/DecretoMariCarmen.tsx  Página que lleva de /decretomaricarmen a la campaña.
  PROMPT-PARA-LOVABLE.txt          Texto para pedirle a Lovable que añada la ruta.

La campaña no se mezcla con vuestra web: no comparte estilos ni código.

PASOS
1. En Lovable, conecta el proyecto a GitHub (botón GitHub → Connect).
   Lovable crea un repositorio y lo mantiene sincronizado en los dos sentidos.
2. Copia las carpetas public/ y src/ de este paquete en ese repositorio,
   respetando la estructura (se suman a las que ya hay; no sustituyen nada).
   Lo más sencillo sin terminal: GitHub Desktop → clonar el repositorio →
   copiar las carpetas → Commit → Push.
   (La subida por la web de GitHub admite como máximo 100 archivos por vez y
   este paquete tiene más, por eso se recomienda GitHub Desktop.)
3. En unos segundos Lovable recibe los cambios. Pega en su chat el texto de
   PROMPT-PARA-LOVABLE.txt para que añada la ruta.
4. Publica (Publish / Update) en Lovable.
5. La campaña queda en:
     https://vuestraweb/decretomaricarmen
   (lleva a https://vuestraweb${PAGINA})

CORREO DE CONTACTO
  Edita public/decretomaricarmen/configuracion.json (correoContacto y
  organizacion) en el repositorio o en el editor de código de Lovable.

El contador de correos se actualiza solo cada 10 minutos.
`
);

// Zip with no extra file attributes (no local user/owner metadata).
execFileSync('zip', ['-qrX', `${NOMBRE}.zip`, NOMBRE, '-x', '*.DS_Store'], { cwd: SALIDA });
console.log(`OK → lovable/${NOMBRE}.zip`);
