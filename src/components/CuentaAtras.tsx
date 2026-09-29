import { useEffect, useState } from 'react';

// Pleno extraordinario: viernes 2 de octubre de 2026, 11:00 hora peninsular (CEST, UTC+2).
const INICIO_PLENO = Date.UTC(2026, 9, 2, 9, 0, 0);
// After this, the vote is over; the page stops inviting "still time" messages.
const FIN_DIA_PLENO = Date.UTC(2026, 9, 2, 22, 0, 0);

const pad = (n: number) => String(n).padStart(2, '0');

export function CuentaAtras() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const ms = INICIO_PLENO - now;

  if (ms <= 0) {
    return (
      <div className="cuenta cuenta--fin">
        <p className="cuenta-label">
          {now < FIN_DIA_PLENO ? 'El pleno ha empezado. Aún estás a tiempo de escribirles.' : 'La votación se celebró el 2 de octubre.'}
        </p>
      </div>
    );
  }

  const s = Math.floor(ms / 1000);
  const partes = [
    { v: Math.floor(s / 86400), l: 'días' },
    { v: Math.floor((s % 86400) / 3600), l: 'horas' },
    { v: Math.floor((s % 3600) / 60), l: 'min' },
    { v: s % 60, l: 'seg' },
  ];

  return (
    <div className="cuenta" role="timer" aria-live="off">
      <p className="cuenta-label">La votación empieza en</p>
      <div className="cuenta-cells">
        {partes.map((p) => (
          <div key={p.l} className="cuenta-cell">
            <span className="cuenta-num num">{pad(p.v)}</span>
            <span className="cuenta-unit">{p.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
