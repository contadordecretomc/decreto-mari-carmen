// Sums the "correos/<n>/<k>" GoatCounter events into public/data/contador.json.
// n = deputies that click added; k = that browser's event number (GoatCounter
// counts unique visitors per path, so k keeps repeat emails from merging).
// Total = Σ n × visitors. Run by .github/workflows/deploy.yml on a schedule.
//
// Env: GOATCOUNTER_SITE  site code (e.g. "contadordecretomc")
//      GOATCOUNTER_TOKEN API key with "Read statistics" permission

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../public/data/contador.json');
// Trimmed: pasting into GitHub secrets easily drags a space or newline along.
const SITE = process.env.GOATCOUNTER_SITE?.trim();
const TOKEN = process.env.GOATCOUNTER_TOKEN?.trim();
const START = '2026-09-29T00:00:00Z'; // campaign launch; the API wants RFC 3339 rounded to the hour
const PATH_RE = /^\/?correos\/(\d+)(?:\/\d+)?$/;
// End-to-end tests run on the live site before launch (29/09/2026), not real emails.
const DESCUENTO_PRUEBAS = 0;

async function api(path, params, tries = 3) {
  const url = `https://${SITE}.goatcounter.com/api/v0/${path}?${new URLSearchParams(params)}`;
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`GoatCounter ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return await res.json();
    } catch (err) {
      // Network errors hide the reason in `cause` (DNS, reset, timeout…).
      const detail = err.cause ? `${err.message} (${err.cause.code ?? err.cause.message})` : err.message;
      if (i >= tries || /GoatCounter 4\d\d/.test(err.message)) throw new Error(`${path} [${params.exclude_paths ? 'página 2+' : 'página 1'}]: ${detail}`);
      await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
}

function nextHour() {
  const d = new Date(Date.now() + 3_600_000);
  d.setUTCMinutes(0, 0, 0);
  return d.toISOString().replace('.000Z', 'Z');
}

async function previous() {
  try {
    return JSON.parse(await readFile(OUT, 'utf8'));
  } catch {
    return { correos: 0, actualizado: null };
  }
}

async function main() {
  const prev = await previous();
  if (!SITE || !TOKEN) {
    await writeFile(OUT, JSON.stringify({ ...prev, error: 'Faltan GOATCOUNTER_SITE o GOATCOUNTER_TOKEN' }, null, 1) + '\n');
    console.log('GOATCOUNTER_SITE / GOATCOUNTER_TOKEN no definidos.');
    return;
  }

  try {
    const end = nextHour();
    const seen = [];
    let correos = 0;
    // stats/hits pages through paths; exclude_paths skips the ones already read.
    for (let page = 0; page < 200; page++) {
      const params = { start: START, end, limit: '100' };
      if (seen.length) params.exclude_paths = seen.join(',');
      const res = await api('stats/hits', params);
      for (const h of res.hits ?? []) {
        seen.push(h.path_id);
        const n = Number(PATH_RE.exec(h.path)?.[1]);
        if (n > 0 && n <= 350) correos += n * (h.count ?? 0);
      }
      if (!res.more || !res.hits?.length) break;
    }
    const bruto = correos;
    correos = Math.max(0, correos - DESCUENTO_PRUEBAS);
    await writeFile(OUT, JSON.stringify({ correos, actualizado: new Date().toISOString() }, null, 1) + '\n');
    console.log(`contador.json → ${correos} correos (${bruto} en GoatCounter − ${DESCUENTO_PRUEBAS} de prueba)`);
  } catch (err) {
    // Never break the deploy over the counter: keep the last number, expose the reason.
    await writeFile(OUT, JSON.stringify({ ...prev, error: String(err.message) }, null, 1) + '\n');
    console.error('No se pudo actualizar el contador:', err.message);
  }
}

main();
