import type { Diputado } from '../types';
import { grupoCorto, mailtoHref, nombreCompleto } from '../lib/mensaje';

export function DiputadoCard({ d }: { d: Diputado }) {
  const nombre = nombreCompleto(d);
  const mailto = mailtoHref(d);
  const cta = `Pídele a ${nombre} que vote el Decreto Mari Carmen este viernes`;

  return (
    <article className="dip-card">
      <div className="dip-photo">
        {d.foto ? (
          <img src={import.meta.env.BASE_URL + d.foto} alt={`Foto de ${nombre}`} loading="lazy" width={124} height={165} />
        ) : (
          <span className="dip-photo-empty">{d.nombre[0]}</span>
        )}
      </div>
      <div className="dip-body">
        <h3 className="dip-name">{nombre}</h3>
        <p className="dip-meta num">
          <span className="dip-group">{grupoCorto(d.grupo)}</span> · {d.circunscripcion}
        </p>
        {mailto ? (
          <a className="dip-cta" href={mailto}>
            {cta}
          </a>
        ) : (
          <>
            <a className="dip-cta dip-cta--nomail" href={d.ficha} target="_blank" rel="noopener noreferrer">
              {cta}
            </a>
            <p className="dip-note">No publica correo en congreso.es · abre su ficha oficial</p>
          </>
        )}
      </div>
    </article>
  );
}
