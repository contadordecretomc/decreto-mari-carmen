// Sums the "correos/<n>" GoatCounter events into public/data/contador.json.
// Each event path carries how many deputies that click added, so the total is
// Σ n × hits. Run by .github/workflows/deploy.yml on a schedule.
//
// Env: GOATCOUNTER_SITE  site code (e.g. "decretomaricarmen")
//      GOATCOUNTER_TOKEN API key with "Read statistics" permission

import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../public/data/contador.json');
const { GOATCOUNTER_SITE: SITE, GOATCOUNTER_TOKEN: TOKEN } = process.env;
const START = '2026-09-29'; // campaign launch

async function api(path, params) {
  const url = `https://${SITE}.goatcounter.com/api/v0/${path}?${new URLSearchParams(params)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  if (!SITE || !TOKEN) {
    console.log('GOATCOUNTER_SITE / GOATCOUNTER_TOKEN no definidos: se mantiene contador.json tal cual.');
    return;
  }

  const end = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const seen = [];
  let correos = 0;
  // stats/hits pages through paths; `exclude_paths` skips the ones already read.
  for (;;) {
    const page = await api('stats/hits', { start: START, end, limit: '100', exclude_paths: seen.join(',') });
    for (const h of page.hits ?? []) {
      seen.push(h.path_id);
      const n = Number(/^\/?correos\/(\d+)$/.exec(h.path)?.[1]);
      if (n > 0 && n <= 350) correos += n * (h.count ?? 0);
    }
    if (!page.more || !page.hits?.length) break;
  }

  await writeFile(OUT, JSON.stringify({ correos, actualizado: new Date().toISOString() }, null, 1) + '\n');
  console.log(`contador.json → ${correos} correos`);
}

main().catch((err) => {
  // Never break the deploy over the counter: keep the previous number.
  console.error('No se pudo actualizar el contador:', err.message);
});
