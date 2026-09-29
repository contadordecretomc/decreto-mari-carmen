import { useEffect, useMemo, useState } from 'react';
import type { DiputadosData } from './types';
import { DiputadoCard } from './components/DiputadoCard';
import { grupoCorto, VOTACION } from './lib/mensaje';

const TODOS = 'Todos';

function normalize(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function App() {
  const [data, setData] = useState<DiputadosData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [grupo, setGrupo] = useState(TODOS);
  const [circ, setCirc] = useState(TODOS);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/diputados.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  const diputados = useMemo(() => data?.diputados ?? [], [data]);

  const grupos = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of diputados) counts.set(grupoCorto(d.grupo), (counts.get(grupoCorto(d.grupo)) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [diputados]);

  const circunscripciones = useMemo(
    () => [...new Set(diputados.map((d) => d.circunscripcion))].sort((a, b) => a.localeCompare(b, 'es')),
    [diputados]
  );

  const visibles = useMemo(() => {
    const q = normalize(query.trim());
    return diputados.filter(
      (d) =>
        (grupo === TODOS || grupoCorto(d.grupo) === grupo) &&
        (circ === TODOS || d.circunscripcion === circ) &&
        (!q || normalize(`${d.nombre} ${d.apellidos} ${d.circunscripcion}`).includes(q))
    );
  }, [diputados, query, grupo, circ]);

  const conEmail = diputados.filter((d) => d.email).length;

  return (
    <div className="app">
      <header className="app-header">
        <div className="eyebrow">Pleno extraordinario · {VOTACION}</div>
        <h1>Decreto Mari Carmen</h1>
        <p className="app-subtitle">
          Hoy el Consejo de Ministros ha aprobado dos reales decretos de vivienda. Para seguir en vigor, el Congreso tiene
          que convalidarlos {VOTACION}. Estos son los 350 diputados y diputadas que deciden.
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

      <section className="stats">
        <div>
          <span className="stat-value">350</span>
          <span className="stat-label">escaños</span>
        </div>
        <div>
          <span className="stat-value">176</span>
          <span className="stat-label">votos para mayoría absoluta</span>
        </div>
        <div>
          <span className="stat-value">{data ? conEmail : '—'}</span>
          <span className="stat-label">con correo público</span>
        </div>
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
            <div className="filters">
              <input
                className="search"
                type="search"
                placeholder="Busca por nombre o provincia…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar diputado"
              />
              <select
                className="select"
                value={circ}
                onChange={(e) => setCirc(e.target.value)}
                aria-label="Filtrar por circunscripción"
              >
                <option value={TODOS}>Todas las provincias</option>
                {circunscripciones.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="chips" role="group" aria-label="Filtrar por grupo parlamentario">
              {[[TODOS, diputados.length] as const, ...grupos].map(([g, n]) => (
                <button
                  key={g}
                  type="button"
                  className={`chip${grupo === g ? ' chip--on' : ''}`}
                  onClick={() => setGrupo(g)}
                  aria-pressed={grupo === g}
                >
                  {g} <span className="num">{n}</span>
                </button>
              ))}
            </div>
            <p className="results-count num">
              {visibles.length} {visibles.length === 1 ? 'diputado' : 'diputados'}
            </p>
            <div className="dip-grid">
              {visibles.map((d) => (
                <DiputadoCard key={d.id} d={d} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Fotos, nombres y correos proceden de las fichas públicas de cada diputado en{' '}
          <a href="https://www.congreso.es/es/busqueda-de-diputados">congreso.es</a> (XV Legislatura)
          {data && <>, consultadas el {new Date(data.actualizado).toLocaleDateString('es-ES')}</>}. El botón abre tu
          programa de correo con un mensaje que puedes editar antes de enviar. Quien no publica correo en su ficha enlaza
          a ella.
        </p>
      </footer>
    </div>
  );
}
