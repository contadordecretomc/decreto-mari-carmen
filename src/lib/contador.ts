// "Correos preparados" counter.
//
// Each click on a write button sends one anonymous GoatCounter event whose path
// encodes how many deputies it adds (`correos/20`). A scheduled GitHub Action
// (scripts/update-contador.mjs) sums count × hits and bakes the total into
// data/contador.json, so the page itself only ever reads a static file.
//
// Each browser counts each deputy once, so repeated clicks don't inflate it.

import { GOATCOUNTER_CODE } from '../config';

const KEY = 'dmc-contados';

function leer(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

function guardar(ids: Set<number>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {
    // Private mode or blocked storage: the count still goes out, just without dedupe.
  }
}

export function misCorreos(): number {
  return leer().size;
}

/** Registers the deputies a message is being prepared for; returns how many were new. */
export function registrarCorreos(ids: number[]): number {
  const contados = leer();
  const nuevos = ids.filter((id) => !contados.has(id));
  if (!nuevos.length) return 0;
  for (const id of nuevos) contados.add(id);
  guardar(contados);

  if (GOATCOUNTER_CODE) {
    // No-JS GoatCounter endpoint: a plain image request, no cookies.
    const q = new URLSearchParams({
      p: `correos/${nuevos.length}`,
      t: 'Correo preparado',
      e: 'true',
      rnd: Math.random().toString(36).slice(2),
    });
    new Image().src = `https://${GOATCOUNTER_CODE}.goatcounter.com/count?${q}`;
  }
  return nuevos.length;
}
