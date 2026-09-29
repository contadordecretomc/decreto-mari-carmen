import type { Diputado } from '../types';
import { fotoSrc } from '../lib/foto';
import { CuentaAtras } from './CuentaAtras';


interface Props {
  diputados: Diputado[];
  onStart: () => void;
}

export function Hero({ diputados, onStart }: Props) {
  return (
    <header className="hero">
      <div className="hero-mosaic" aria-hidden="true">
        {diputados.map((d) => (d.foto ? <img key={d.id} src={fotoSrc(d.foto)} alt="" loading="lazy" /> : <span key={d.id} />))}
      </div>

      <div className="hero-strip num" aria-hidden="true">
        <span>Pleno extraordinario</span>
        <span>Viernes 2 de octubre · 11:00</span>
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

        <CuentaAtras />

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
            <dt className="hero-stat-value num">2</dt>
            <dd className="hero-stat-label">decretos en juego</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}
