import { useState } from 'react';
import { ALTAS, mailtoAlta, mensajeAlta } from '../lib/altas';
import { CopyButton } from './CopyButton';

// Under the counter: voluntary, per-organisation sign-up that opens the
// person's own mail app. Boxes start unticked (pre-ticked boxes aren't valid
// consent) and the button only works once at least one is ticked.
export function AltaBanda() {
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set());
  const elegidas = ALTAS.organizaciones.filter((o) => marcadas.has(o.id));
  const m = elegidas.length ? mensajeAlta(elegidas) : null;

  function alternar(id: string) {
    setMarcadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="alta" aria-labelledby="alta-titulo">
      <h2 id="alta-titulo" className="alta-titulo">
        Sigue informado/a
      </h2>
      <div className="alta-opciones">
        {ALTAS.organizaciones.map((o) => (
          <label key={o.id} className="alta-opcion">
            <input type="checkbox" checked={marcadas.has(o.id)} onChange={() => alternar(o.id)} />
            <span>
              Quiero recibir información {o.articulo === 'el' ? 'del' : 'de'} <strong>{o.nombre}</strong>{' '}
              <span className="alta-correo num">({o.correo})</span>
            </span>
          </label>
        ))}
      </div>

      {m ? (
        <a className="dip-cta alta-cta" href={mailtoAlta(m)}>
          Preparar mi correo de alta
        </a>
      ) : (
        <span className="dip-cta alta-cta is-disabled" aria-disabled="true">
          Marca al menos una organización
        </span>
      )}

      {m && (
        <div className="copy-row alta-copiar">
          <CopyButton text={m.to} label="Copiar dirección" />
          <CopyButton text={`${m.subject}\n\n${m.body}`} label="Copiar mensaje" />
        </div>
      )}

      <p className="alta-nota">
        Se abrirá tu correo con un mensaje que envías tú. Tu dirección llegará a {ALTAS.gestiona}, que la comunicará solo
        a las organizaciones que marques, para que te informen. Puedes darte de baja cuando quieras.
      </p>
    </section>
  );
}
