import type { Diputado } from '../types';
import { grupoCorto, mailtoHref, mensaje, nombreCompleto } from '../lib/mensaje';
import { CopyButton } from './CopyButton';

function fotoSrc(foto: string) {
  // The artifact build embeds photos as data: URIs; the site serves them as files.
  return foto.startsWith('data:') ? foto : import.meta.env.BASE_URL + foto;
}

export function DiputadoCard({ d }: { d: Diputado }) {
  const nombre = nombreCompleto(d);
  const m = mensaje(d);
  const cta = `Pídele a ${nombre} que vote el Decreto Mari Carmen este viernes`;

  return (
    <article className="dip-card">
      <div className="dip-photo">
        {d.foto ? (
          <img src={fotoSrc(d.foto)} alt={`Foto de ${nombre}`} loading="lazy" width={124} height={165} />
        ) : (
          <span className="dip-photo-empty">{d.nombre[0]}</span>
        )}
      </div>
      <div className="dip-body">
        <h3 className="dip-name">{nombre}</h3>
        <p className="dip-meta num">
          <span className="dip-group">{grupoCorto(d.grupo)}</span> · {d.circunscripcion}
        </p>
        {m ? (
          <>
            <a className="dip-cta" href={mailtoHref(m)}>
              {cta}
            </a>
            <p className="dip-email num">{m.to}</p>
            <div className="copy-row">
              <CopyButton text={m.to} label="Copiar dirección" />
              <CopyButton text={`${m.subject}\n\n${m.body}`} label="Copiar mensaje" />
            </div>
            {!d.email && d.contactoGrupo && (
              <p className="dip-note">
                No publica correo propio · le llegará a través de{' '}
                <a href={d.contactoGrupo.fuente} target="_blank" rel="noopener noreferrer">
                  {d.contactoGrupo.nombre}
                </a>
              </p>
            )}
          </>
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
