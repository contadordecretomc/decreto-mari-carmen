// Turns the GitHub Pages copy into a redirect to the site's new address,
// keeping data/contador.json published (the new site reads the counter from it).
//
// Runs in .github/workflows/deploy.yml after the build, only when the repo
// variable REDIRIGIR_A is set (e.g. https://webdeejemplo.com/decretomaricarmen/).
// The #anchor is carried over, so links to a deputy (#d-160) keep working.

import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '../dist');
const destino = process.env.REDIRIGIR_A?.trim();

if (!destino) {
  console.log('REDIRIGIR_A vacío: se publica la web completa en GitHub Pages.');
  process.exit(0);
}
if (!/^https:\/\/[^\s"'<>]+$/.test(destino)) {
  console.error(`REDIRIGIR_A no es una dirección https válida: ${destino}`);
  process.exit(1);
}

const url = JSON.stringify(destino);
const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<link rel="canonical" href=${url} />
<title>Decreto Mari Carmen · Nueva dirección</title>
<script>location.replace(${url} + location.hash);</script>
<noscript><meta http-equiv="refresh" content="0; url=${destino}" /></noscript>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#14201b;color:#f2f4ef;font:16px/1.5 system-ui,sans-serif;text-align:center;padding:24px}a{color:#f3b79f}</style>
</head>
<body>
<p>La campaña del Decreto Mari Carmen se ha trasladado a<br /><a href=${url}>${destino}</a></p>
</body>
</html>
`;

await writeFile(join(DIST, 'index.html'), html);
console.log(`dist/index.html → redirección a ${destino} (data/contador.json sigue publicado)`);
