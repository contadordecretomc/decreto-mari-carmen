// Biography and start date from the Congreso open-data "Diputados en activo" file.
// The file name carries a timestamp, so it is discovered from the open-data page.

const BASE = 'https://www.congreso.es';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

export async function fetchOpenData() {
  const page = await (await fetch(`${BASE}/es/opendata/diputados`, { headers: { 'User-Agent': UA } })).text();
  const path = page.match(/\/webpublica\/opendata\/diputados\/DiputadosActivos__\d+\.json/)?.[0];
  if (!path) throw new Error('No se encontró el JSON de diputados activos en opendata');
  const rows = await (await fetch(BASE + path, { headers: { 'User-Agent': UA } })).json();
  const byName = new Map();
  for (const r of rows) {
    byName.set(norm(r.NOMBRE), {
      biografia: r.BIOGRAFIA?.replace(/\s+/g, ' ').trim() || null,
      fechaAlta: r.FECHAALTA || null,
    });
  }
  return (apellidos, nombre) => byName.get(norm(`${apellidos}, ${nombre}`)) ?? { biografia: null, fechaAlta: null };
}
