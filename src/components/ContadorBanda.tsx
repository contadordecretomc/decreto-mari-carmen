import { useEffect, useState } from 'react';
import type { ContadorData } from '../types';

const fmt = (n: number) => n.toLocaleString('es-ES');

// Counts up from 0 on first render so the figure lands with some weight.
function useCuentaAscendente(objetivo: number, ms = 1400) {
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [v, setV] = useState(0);

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(objetivo * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [objetivo, ms, reduce]);

  return reduce ? objetivo : v;
}

export function ContadorBanda({ contador, mios }: { contador: ContadorData | null; mios: number }) {
  const total = contador?.correos ?? 0;
  const visible = useCuentaAscendente(total);

  return (
    <section className="cbanda" aria-live="polite">
      {total > 0 ? (
        <>
          <p className="cbanda-pre">La ciudadanía ha preparado</p>
          <p className="cbanda-num num" aria-label={`${fmt(total)} correos`}>
            {fmt(visible)}
          </p>
          <p className="cbanda-post">
            correos a sus diputados para que voten a favor del <strong>Decreto Mari Carmen</strong>
          </p>
        </>
      ) : (
        <p className="cbanda-post">
          Sé de las primeras personas en escribir a los diputados para que voten a favor del{' '}
          <strong>Decreto Mari Carmen</strong>.
        </p>
      )}
      <p className="cbanda-meta">
        Se actualiza cada 10 minutos
        {mios > 0 && (
          <>
            {' · '}
            <strong>
              Tú has preparado {fmt(mios)} {mios === 1 ? 'correo' : 'correos'}
            </strong>
          </>
        )}
      </p>
    </section>
  );
}
