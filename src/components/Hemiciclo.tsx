import { useMemo, useRef, useState } from 'react';
import type { Diputado } from '../types';
import { GRUPOS, type GrupoInfo } from '../lib/grupos';
import { HEIGHT, SEAT_R, WIDTH, seatLayout } from '../lib/hemiciclo';

interface Props {
  diputados: Diputado[];
  selected: string | null;
  onSelect: (grupo: GrupoInfo) => void;
}

interface Tip {
  grupo: GrupoInfo;
  n: number;
  x: number;
  y: number;
}

export function Hemiciclo({ diputados, selected, onSelect }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  const bloques = useMemo(() => {
    const seats = seatLayout(diputados.length);
    const counts = GRUPOS.map((g) => diputados.filter((d) => d.grupo === g.grupo).length);
    const starts = counts.map((_, k) => counts.slice(0, k).reduce((a, b) => a + b, 0));
    return GRUPOS.map((g, k) => ({ g, n: counts[k], seats: seats.slice(starts[k], starts[k] + counts[k]) })).filter(
      (b) => b.n > 0
    );
  }, [diputados]);

  function moveTip(e: React.PointerEvent, g: GrupoInfo, n: number) {
    const box = wrapRef.current!.getBoundingClientRect();
    setTip({ grupo: g, n, x: e.clientX - box.left, y: e.clientY - box.top });
  }

  const focus = hover ?? selected;

  return (
    <div className="hemi" ref={wrapRef}>
      <svg
        className="hemi-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="group"
        aria-label="Hemiciclo del Congreso: elige un grupo parlamentario"
        onPointerLeave={() => {
          setHover(null);
          setTip(null);
        }}
      >
        {bloques.map(({ g, n, seats }) => (
          <g
            key={g.id}
            className={`hemi-grupo${focus && focus !== g.id ? ' is-dim' : ''}${selected === g.id ? ' is-on' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`${g.grupo}, ${n} escaños`}
            aria-pressed={selected === g.id}
            onPointerEnter={(e) => {
              setHover(g.id);
              moveTip(e, g, n);
            }}
            onPointerMove={(e) => moveTip(e, g, n)}
            onClick={() => onSelect(g)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(g);
              }
            }}
            onFocus={() => setHover(g.id)}
            onBlur={() => setHover(null)}
          >
            {seats.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={SEAT_R} fill={g.color} />
            ))}
            {/* Invisible, larger hit area so the gaps between seats don't flicker the hover. */}
            {seats.map((s, i) => (
              <circle key={`h${i}`} className="hemi-hit" cx={s.x} cy={s.y} r={SEAT_R * 1.75} />
            ))}
          </g>
        ))}
        <text className="hemi-total num" x={WIDTH / 2} y={HEIGHT - 70} textAnchor="middle">
          {diputados.length}
        </text>
        <text className="hemi-total-label num" x={WIDTH / 2} y={HEIGHT - 42} textAnchor="middle">
          ESCAÑOS · MAYORÍA 176
        </text>
      </svg>
      {tip && (
        <div className="hemi-tip" style={{ left: tip.x, top: tip.y }}>
          <span className="swatch" style={{ background: tip.grupo.color }} />
          <strong>{tip.grupo.grupo}</strong>
          <span className="num">{tip.n} escaños</span>
        </div>
      )}
      <div className="chips hemi-legend" role="group" aria-label="Grupos parlamentarios">
        {bloques.map(({ g, n }) => (
          <button
            key={g.id}
            type="button"
            className={`chip${selected === g.id ? ' chip--on' : ''}`}
            onClick={() => onSelect(g)}
            onPointerEnter={() => setHover(g.id)}
            onPointerLeave={() => setHover(null)}
            aria-pressed={selected === g.id}
          >
            <span className="swatch" style={{ background: g.color }} />
            {g.corto} <span className="num">{n}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
