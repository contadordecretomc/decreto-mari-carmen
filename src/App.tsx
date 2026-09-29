import { useEffect, useMemo, useRef, useState } from 'react';
import type { Diputado, DiputadosData } from './types';
import { Hemiciclo } from './components/Hemiciclo';
import { SeleccionPanel } from './components/SeleccionPanel';
import { Ficha } from './components/Ficha';
import type { GrupoInfo } from './lib/grupos';
import { VOTACION } from './lib/mensaje';

function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// The single-file artifact build ships the data inline (see scripts/build-artifact.mjs).
function readEmbeddedData(): DiputadosData | null {
  const embedded = document.getElementById('diputados-data');
  return embedded?.textContent ? JSON.parse(embedded.textContent) : null;
}

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

const PANEL_ID = 'seleccion';

export default function App() {
  const [data, setData] = useState<DiputadosData | null>(readEmbeddedData);
  const [error, setError] = useState<string | null>(null);
  const [grupoSel, setGrupoSel] = useState<GrupoInfo | null>(null);
  const [query, setQuery] = useState('');
  const [seleccion, setSeleccion] = useState<Set<number>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const hash = useHash();

  useEffect(() => {
    if (data) return;
    fetch(import.meta.env.BASE_URL + 'data/diputados.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch((e: Error) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const diputados = useMemo(() => data?.diputados ?? [], [data]);

  function buscar(q: string): Diputado[] {
    const n = normalize(q.trim());
    if (!n) return [];
    return diputados.filter((d) => normalize(`${d.nombre} ${d.apellidos} ${d.circunscripcion}`).includes(n));
  }

  const enPanel: Diputado[] = query.trim()
    ? buscar(query)
    : grupoSel
      ? diputados.filter((d) => d.grupo === grupoSel.grupo)
      : [];

  function seleccionarGrupo(g: GrupoInfo) {
    setGrupoSel(g);
    setQuery('');
    setSeleccion(new Set(diputados.filter((d) => d.grupo === g.grupo).map((d) => d.id)));
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function onQuery(q: string) {
    setQuery(q);
    setSeleccion(new Set((q.trim() ? buscar(q) : grupoSel ? diputados.filter((d) => d.grupo === grupoSel.grupo) : []).map((d) => d.id)));
  }

  function toggle(id: number) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const fichaId = Number(/^#d-(\d+)$/.exec(hash)?.[1]);
  const ficha = fichaId ? diputados.find((d) => d.id === fichaId) : undefined;

  useEffect(() => {
    if (ficha) window.scrollTo(0, 0);
    else if (hash === `#${PANEL_ID}`) panelRef.current?.scrollIntoView({ block: 'start' });
  }, [ficha, hash]);

  if (ficha) {
    return (
      <div className="app">
        <p className="site-mark">
          <a href={`#${PANEL_ID}`}>Decreto Mari Carmen</a>
        </p>
        <Ficha d={ficha} backHref={`#${PANEL_ID}`} />
      </div>
    );
  }

  const panelGrupo = !query.trim() && grupoSel;

  return (
    <div className="app">
      <header className="app-header">
        <div className="eyebrow">Pleno extraordinario · {VOTACION}</div>
        <h1>Decreto Mari Carmen</h1>
        <p className="app-subtitle">
          Hoy el Consejo de Ministros ha aprobado dos reales decretos de vivienda. Para seguir en vigor, el Congreso tiene
          que convalidarlos {VOTACION}. Elige un grupo parlamentario en el hemiciclo y escribe a sus diputados.
        </p>
      </header>

      <section className="callout callout--warning">
        <div className="eyebrow">Qué se vota</div>
        <p>
          <strong>Primer decreto:</strong> protección frente a los desahucios hasta 2030, regulación del alquiler de
          temporada y por habitaciones, prohibición de compra de vivienda por fondos buitre hasta 2028 y prórroga de dos
          años para los contratos de alquiler que venzan antes del 31 de diciembre de 2028.
        </p>
        <p>
          <strong>Segundo decreto:</strong> renovación automática de los contratos de alquiler.
        </p>
        <p className="muted">
          Se llama así por Mari Carmen, una mujer de 87 años desahuciada en Madrid cuyo caso ha movilizado a medio país.
        </p>
      </section>

      <main>
        {!data && !error && <p className="status-message">Cargando diputados…</p>}
        {error && (
          <p className="status-message status-error">
            No se pudieron cargar los datos: {error}. Ejecuta <code>npm run scrape</code> y recarga.
          </p>
        )}
        {data && (
          <>
            <section className="hemi-panel">
              <Hemiciclo diputados={diputados} selected={panelGrupo ? grupoSel.id : null} onSelect={seleccionarGrupo} />
              <div className="filters">
                <input
                  id="buscar"
                  className="search"
                  type="search"
                  placeholder="O busca a alguien por nombre o provincia…"
                  value={query}
                  onChange={(e) => onQuery(e.target.value)}
                  aria-label="Buscar diputado por nombre o provincia"
                />
              </div>
            </section>

            <div id={PANEL_ID} ref={panelRef} className="panel-anchor">
              {enPanel.length > 0 ? (
                <SeleccionPanel
                  key={panelGrupo ? panelGrupo.id : 'busqueda'}
                  titulo={panelGrupo ? panelGrupo.grupo : `Resultados para «${query.trim()}»`}
                  ctaTodos={
                    panelGrupo
                      ? `Escribir a los diputados del ${panelGrupo.grupo}`
                      : `Escribir a ${enPanel.length === 1 ? '1 diputado' : `los ${enPanel.length} diputados`}`
                  }
                  color={panelGrupo ? panelGrupo.color : undefined}
                  diputados={enPanel}
                  seleccion={seleccion}
                  onToggle={toggle}
                  onAll={(on) => setSeleccion(new Set(on ? enPanel.map((d) => d.id) : []))}
                />
              ) : query.trim() ? (
                <p className="status-message">Nadie coincide con «{query.trim()}».</p>
              ) : (
                <p className="panel-empty muted">
                  Pulsa un grupo del hemiciclo para ver a sus diputados y escribirles.
                </p>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Fotos, nombres, correos y biografías proceden de las fichas públicas de cada diputado en{' '}
          <a href="https://www.congreso.es/es/busqueda-de-diputados">congreso.es</a> y de sus datos abiertos (XV
          Legislatura)
          {data && <>, consultados el {new Date(data.actualizado).toLocaleDateString('es-ES')}</>}. Los botones abren tu
          aplicación de correo con un mensaje que puedes editar antes de enviar. A quien no publica correo en su ficha se
          le escribe a la dirección general de su grupo parlamentario o su partido.
        </p>
      </footer>
    </div>
  );
}
