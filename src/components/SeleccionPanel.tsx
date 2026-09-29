import type { Diputado } from '../types';
import { direcciones, mailtoCcHref, mensajeColectivo, nombreCompleto } from '../lib/mensaje';
import { fichaHash, fotoSrc } from '../lib/foto';
import { CopyButton } from './CopyButton';

interface Props {
  titulo: string;
  /** Button label when everyone is selected, e.g. "Escribir a los diputados del Grupo Parlamentario VOX". */
  ctaTodos: string;
  color?: string;
  diputados: Diputado[];
  seleccion: Set<number>;
  onToggle: (id: number) => void;
  onAll: (on: boolean) => void;
  /** Counts the selected deputies as prepared emails (see lib/contador.ts). */
  onPreparar: (ids: number[]) => void;
}

export function SeleccionPanel({ titulo, ctaTodos, color, diputados, seleccion, onToggle, onAll, onPreparar }: Props) {
  const elegidos = diputados.filter((d) => seleccion.has(d.id));
  const m = mensajeColectivo(elegidos);
  const { viaGrupo } = direcciones(elegidos);
  const todos = elegidos.length === diputados.length;
  const preparar = () => onPreparar(elegidos.map((d) => d.id));
  const cta = todos ? ctaTodos : `Escribir a ${elegidos.length === 1 ? '1 diputado' : `los ${elegidos.length} diputados`} seleccionados`;

  return (
    <section className="panel" style={{ '--grupo': color ?? 'var(--ink)' } as React.CSSProperties}>
      <header className="panel-head">
        <div>
          <h2 className="panel-title">{titulo}</h2>
          <p className="panel-count num">
            {elegidos.length} de {diputados.length} seleccionados
          </p>
        </div>
        <div className="panel-toggles">
          <button type="button" className="copy-btn" onClick={() => onAll(true)} disabled={todos}>
            Marcar todos
          </button>
          <button type="button" className="copy-btn" onClick={() => onAll(false)} disabled={!elegidos.length}>
            Desmarcar todos
          </button>
        </div>
      </header>

      <div className="panel-actions">
        {elegidos.length ? (
          <a className="dip-cta panel-cta" href={mailtoCcHref(m)} onClick={preparar}>
            {cta}
          </a>
        ) : (
          <span className="dip-cta panel-cta is-disabled" aria-disabled="true">
            Marca al menos un diputado
          </span>
        )}
        <div className="copy-row">
          <CopyButton text={m.cc.join(', ')} label="Copiar direcciones" />
          <CopyButton text={`${m.subject}\n\n${m.body}`} label="Copiar mensaje" onCopy={preparar} />
        </div>
        <p className="dip-note">
          Abre tu aplicación de correo con {m.cc.length} {m.cc.length === 1 ? 'dirección' : 'direcciones'} en copia (CC).
          {viaGrupo.length > 0 &&
            ` ${viaGrupo.length} no ${viaGrupo.length === 1 ? 'publica' : 'publican'} correo propio: se incluye la dirección de su grupo o partido.`}
          {m.cc.length > 40 && ' Si tu programa no abre con tantas direcciones, usa «Copiar direcciones».'}
        </p>
      </div>

      <ul className="tiles">
        {diputados.map((d, i) => {
          const on = seleccion.has(d.id);
          const nombre = nombreCompleto(d);
          return (
            <li
              key={d.id}
              className={`tile${on ? '' : ' is-off'}`}
              style={{ '--i': Math.min(i, 60) } as React.CSSProperties}
            >
              <a className="tile-photo" href={fichaHash(d.id)} title={`Ver ficha de ${nombre}`}>
                {d.foto ? <img src={fotoSrc(d.foto)} alt="" loading="lazy" width={124} height={165} /> : null}
              </a>
              <label className="tile-check">
                <input type="checkbox" checked={on} onChange={() => onToggle(d.id)} />
                <span className="sr-only">Incluir a {nombre}</span>
              </label>
              <a className="tile-name" href={fichaHash(d.id)}>
                {nombre}
              </a>
              <span className="tile-meta">{d.circunscripcion}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
