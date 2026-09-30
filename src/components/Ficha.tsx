import type { Diputado } from '../types';
import { mailtoHref, mensaje, nombreCompleto } from '../lib/mensaje';
import { grupoInfo } from '../lib/grupos';
import { fotoSrc } from '../lib/foto';
import { CopyButton } from './CopyButton';

interface Props {
  d: Diputado;
  backHref: string;
  /** Counts the deputy as a prepared email (see lib/contador.ts). */
  onPreparar: (ids: number[]) => void;
}

export function Ficha({ d, backHref, onPreparar }: Props) {
  const nombre = nombreCompleto(d);
  const g = grupoInfo(d.grupo);
  const m = mensaje(d);
  const cta = `Pídele a ${nombre} que vote el Decreto Mari Carmen este viernes`;
  const f = d.genero === 'f';

  return (
    <article className="ficha" style={{ '--grupo': g.color } as React.CSSProperties}>
      <a href={backHref} className="back-link">
        ← Volver al hemiciclo
      </a>

      <div className="ficha-top">
        <div className="ficha-photo">
          {d.foto ? <img src={fotoSrc(d.foto)} alt={`Foto de ${nombre}`} width={124} height={165} /> : null}
        </div>
        <div className="ficha-id">
          <div className="eyebrow ficha-eyebrow">{g.grupo}</div>
          <h1>{nombre}</h1>
          <dl className="ficha-datos">
            <div>
              <dt>Circunscripción</dt>
              <dd>{d.circunscripcion}</dd>
            </div>
            <div>
              <dt>Formación</dt>
              <dd>{d.formacion}</dd>
            </div>
            {d.fechaAlta && (
              <div>
                <dt>{f ? 'Diputada' : 'Diputado'} desde</dt>
                <dd className="num">{d.fechaAlta}</dd>
              </div>
            )}
            <div>
              <dt>Correo</dt>
              <dd className="num ficha-email">
                {d.email ?? (d.contactoGrupo ? `${d.contactoGrupo.email} (${d.contactoGrupo.nombre})` : 'No publica')}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="ficha-escribir">
        {m ? (
          <>
            <a className="dip-cta" href={mailtoHref(m)} onClick={() => onPreparar([d.id])}>
              {cta}
            </a>
            <p className="dip-respeto">Escribe con respeto: el objetivo es convencer.</p>
            <div className="copy-row">
              <CopyButton text={m.to} label="Copiar dirección" />
              <CopyButton
                text={`${m.subject}\n\n${m.body}`}
                label="Copiar mensaje"
                onCopy={() => onPreparar([d.id])}
              />
            </div>
            {!d.email && d.contactoGrupo && (
              <p className="dip-note">
                No publica correo propio · le llegará a través de{' '}
                <a href={d.contactoGrupo.fuente} target="_blank" rel="noopener noreferrer">
                  {d.contactoGrupo.nombre}
                </a>
              </p>
            )}
            <details className="ficha-mensaje">
              <summary>Ver el mensaje</summary>
              <p className="ficha-asunto">
                <span className="stat-label">Asunto</span> {m.subject}
              </p>
              <pre>{m.body}</pre>
            </details>
          </>
        ) : (
          <a className="dip-cta dip-cta--nomail" href={d.ficha} target="_blank" rel="noopener noreferrer">
            {cta}
          </a>
        )}
      </section>

      {d.biografia && (
        <section className="ficha-bio">
          <h2>Biografía</h2>
          <p>{d.biografia}</p>
        </section>
      )}

      <p className="source-note">
        Datos de su{' '}
        <a href={d.ficha} target="_blank" rel="noopener noreferrer">
          ficha oficial en congreso.es
        </a>{' '}
        y de los datos abiertos del Congreso.
      </p>
    </article>
  );
}
