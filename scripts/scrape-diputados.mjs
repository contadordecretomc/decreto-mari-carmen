// Scrapes the 350 active deputies of the XV Legislatura from congreso.es:
// list (search endpoint) → each deputy's public profile page for the email,
// then downloads each official photo into public/fotos so the site is fully static.
//
// Output: public/data/diputados.json
// Usage:  npm run scrape

import { writeFile, mkdir, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contactoGrupo } from './contactos-grupos.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_JSON = join(ROOT, 'public/data/diputados.json');
const FOTOS_DIR = join(ROOT, 'public/fotos');

const BASE = 'https://www.congreso.es';
const LEGISLATURA = 15;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const CONCURRENCY = 6;
const FORCE_PHOTOS = process.argv.includes('--force-photos');

async function fetchWithRetry(url, init = {}, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { ...init, headers: { 'User-Agent': UA, ...init.headers } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      if (i >= tries) throw new Error(`${url}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 800 * i));
    }
  }
}

async function listDiputados() {
  const url =
    `${BASE}/es/busqueda-de-diputados?p_p_id=diputadomodule&p_p_lifecycle=2&p_p_state=normal` +
    `&p_p_mode=view&p_p_resource_id=searchDiputados&p_p_cacheability=cacheLevelPage`;
  const body = new URLSearchParams({
    _diputadomodule_idLegislatura: String(LEGISLATURA),
    _diputadomodule_genero: '0',
    _diputadomodule_grupo: 'all',
    _diputadomodule_tipo: '0', // 0 = en activo
    _diputadomodule_nombre: '',
    _diputadomodule_apellidos: '',
    _diputadomodule_formacion: 'all',
    _diputadomodule_filtroProvincias: '[]',
    _diputadomodule_nombreCircunscripcion: '',
  });
  const res = await fetchWithRetry(url, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const { data } = await res.json();
  return data.filter((d) => !d.fchBaja);
}

function fichaUrl(cod) {
  return (
    `${BASE}/es/busqueda-de-diputados?p_p_id=diputadomodule&p_p_lifecycle=0&p_p_state=normal` +
    `&p_p_mode=view&_diputadomodule_mostrarFicha=true&codParlamentario=${cod}&idLegislatura=XV`
  );
}

async function scrapeFicha(cod) {
  const html = await (await fetchWithRetry(fichaUrl(cod))).text();
  // Only institutional/public addresses shown on the profile; prefer @congreso.es.
  const emails = [...new Set(html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/g) ?? [])].filter(
    (e) => !/^(webmaster|prensa|info)@/i.test(e) && !/\.(png|jpe?g|gif|svg)$/i.test(e)
  );
  const email = emails.find((e) => e.endsWith('@congreso.es')) ?? emails[0] ?? null;
  const photo = html.match(/\/docu\/imgweb\/diputados\/[^"']+\.jpg/)?.[0] ?? null;
  return { email, photo };
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function downloadPhoto(remotePath, cod) {
  const file = `${cod}.jpg`;
  const dest = join(FOTOS_DIR, file);
  if (!FORCE_PHOTOS && (await exists(dest))) return `fotos/${file}`;
  const res = await fetchWithRetry(BASE + remotePath);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return `fotos/${file}`;
}

async function mapPool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

async function main() {
  await mkdir(FOTOS_DIR, { recursive: true });
  await mkdir(dirname(OUT_JSON), { recursive: true });

  const lista = await listDiputados();
  console.log(`Diputados en activo: ${lista.length}`);

  let done = 0;
  const diputados = await mapPool(lista, CONCURRENCY, async (d) => {
    const cod = d.codParlamentario;
    let email = null;
    let foto = null;
    try {
      const ficha = await scrapeFicha(cod);
      email = ficha.email;
      foto = await downloadPhoto(ficha.photo ?? `/docu/imgweb/diputados/${cod}_${LEGISLATURA}.jpg`, cod);
    } catch (err) {
      console.warn(`  ! ${d.apellidosNombre}: ${err.message}`);
    }
    if (++done % 25 === 0) console.log(`  ${done}/${lista.length}`);
    return {
      id: cod,
      nombre: d.nombre.trim(),
      apellidos: d.apellidos.trim(),
      genero: d.genero === 2 ? 'f' : 'm',
      circunscripcion: d.nombreCircunscripcion,
      formacion: d.formacion,
      grupo: d.grupo,
      email,
      contactoGrupo: email ? null : contactoGrupo(d.formacion),
      foto,
      ficha: fichaUrl(cod),
    };
  });

  diputados.sort((a, b) => a.apellidos.localeCompare(b.apellidos, 'es'));
  const sinEmail = diputados.filter((d) => !d.email);
  await writeFile(
    OUT_JSON,
    JSON.stringify({ actualizado: new Date().toISOString(), legislatura: LEGISLATURA, diputados }, null, 1) + '\n'
  );
  console.log(`OK → ${OUT_JSON} (${diputados.length} diputados, ${sinEmail.length} sin email)`);
  for (const d of sinEmail)
    console.log(`  sin email: ${d.apellidos}, ${d.nombre} → ${d.contactoGrupo?.email ?? 'SIN CONTACTO DE GRUPO'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
