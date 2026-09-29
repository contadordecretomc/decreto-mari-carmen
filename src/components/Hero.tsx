import type { Diputado } from '../types';
import { fotoSrc } from '../lib/foto';

// Pleno extraordinario de convalidación (Europe/Madrid calendar day).
const VOTE_DAY = new Date(2026, 9, 2);

function diasHastaVotacion(now = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((VOTE_DAY.getTime() - today.getTime()) / 86_400_000);
}

function Cuenta() {
  const dias = diasHastaVotacion();
  if (dias < 0) return <dd className="hero-stat-label">Votación celebrada el 2 de octubre</dd>;
  return (
    <>
      <dt className="hero-stat-value num">{dias === 0 ? 'HOY' : dias}</dt>
      <dd className="hero-stat-label">{dias === 0 ? 'se vota en el Congreso' : dias === 1 ? 'día para la votación' : 'días para la votación'}</dd>
    </>
  );
}

export function Hero({ diputados, onStart }: { diputados: Diputado[]; onStart: () => void }) {
  return (
    <header className="hero">
      <div className="hero-mosaic" aria-hidden="true">
        {diputados.map((d) => (d.foto ? <img key={d.id} src={fotoSrc(d.foto)} alt="" loading="lazy" /> : <span key={d.id} />))}
      </div>

      <div className="hero-strip num" aria-hidden="true">
        <span>Pleno extraordinario</span>
        <span>Viernes 2 de octubre</span>
        <span>Congreso de los Diputados</span>
      </div>

      <div className="hero-body">
        <p className="hero-kicker">350 caras. Una votación.</p>
        <h1 className="hero-title">
          Que no dejen caer el <em>Decreto Mari Carmen</em>
        </h1>
        <p className="hero-lede">
          Mari Carmen tiene 87 años y la desahuciaron en Madrid. Este viernes, el Congreso decide si las medidas de
          vivienda que llevan su nombre siguen adelante. Los diputados tienen que saber que las estamos mirando.
        </p>

        <div className="hero-actions">
          <button type="button" className="hero-cta" onClick={onStart}>
            Escribe a tus diputados ↓
          </button>
        </div>

        <dl className="hero-stats">
          <div>
            <dt className="hero-stat-value num">350</dt>
            <dd className="hero-stat-label">diputados deciden</dd>
          </div>
          <div>
            <dt className="hero-stat-value num">176</dt>
            <dd className="hero-stat-label">votos para mayoría absoluta</dd>
          </div>
          <div>
            <Cuenta />
          </div>
        </dl>
      </div>
    </header>
  );
}
