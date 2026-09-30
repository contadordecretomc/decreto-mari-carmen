import { CONTACTO_EMAIL, CONTADOR_EXTERNO, ORGANIZACION, SITE_URL } from '../config';

function dominio(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function Privacidad({ backHref }: { backHref: string }) {
  return (
    <article className="legal">
      <a href={backHref} className="back-link">
        ← Volver a la web
      </a>
      <h1>Aviso de privacidad y fuentes</h1>
      <p className="legal-lede">
        {ORGANIZACION ? `Esta web es una campaña de ${ORGANIZACION}` : 'Esta web es una campaña ciudadana sin ánimo de lucro'}{' '}
        para pedir a los diputados y diputadas que voten a favor de convalidar el Decreto Mari Carmen. Aquí se explica
        qué datos usa, de dónde salen y cómo contactar.
      </p>

      <h2>{ORGANIZACION ? 'Responsable y contacto' : 'Contacto'}</h2>
      <p>
        {ORGANIZACION && <>La responsable del tratamiento de los datos es {ORGANIZACION}. </>}
        Para cualquier consulta, o para pedir que se corrija o se retire un dato, escribe a{' '}
        <a href={`mailto:${CONTACTO_EMAIL}`}>{CONTACTO_EMAIL}</a>.
      </p>

      <h2>Datos de los diputados y diputadas</h2>
      <ul>
        <li>
          <strong>Qué datos:</strong> nombre, grupo parlamentario, formación, circunscripción, fecha de alta, biografía,
          correo institucional y foto oficial.
        </li>
        <li>
          <strong>De dónde salen:</strong> de las fichas públicas de cada diputado en{' '}
          <a href="https://www.congreso.es/es/busqueda-de-diputados" target="_blank" rel="noopener noreferrer">
            congreso.es
          </a>{' '}
          y de los datos abiertos del Congreso de los Diputados. Cuando alguien no publica correo, se usa la dirección
          general que su grupo parlamentario o su partido publica en su web oficial. No se deduce ni se inventa ninguna
          dirección.
        </li>
        <li>
          <strong>Para qué:</strong> para que la ciudadanía pueda dirigirse a sus representantes sobre esta votación, en
          ejercicio de los derechos de petición y de participación en los asuntos públicos (arts. 23 y 29 de la
          Constitución).
        </li>
        <li>
          <strong>Base jurídica:</strong> el interés público y el interés legítimo en facilitar el contacto con cargos
          públicos (art. 6.1.e y 6.1.f del Reglamento General de Protección de Datos), sobre datos profesionales que el
          propio Congreso publica.
        </li>
        <li>
          <strong>Cuánto tiempo:</strong> mientras dure la campaña.
        </li>
        <li>
          <strong>Tus derechos:</strong> puedes pedir el acceso, la rectificación, la supresión o la oposición al uso de
          tus datos escribiendo al correo de contacto. También puedes reclamar ante la{' '}
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
            Agencia Española de Protección de Datos
          </a>
          .
        </li>
      </ul>

      <h2>Si visitas la web</h2>
      <ul>
        <li>
          <strong>No recogemos tu nombre ni tu correo.</strong> Los botones abren tu propia aplicación de correo con un
          borrador que puedes editar o descartar. El correo sale de tu cuenta y no pasa por esta web.
        </li>
        <li>
          <strong>Contador de correos preparados:</strong> al pulsar un botón de escribir o «Copiar mensaje», la web
          envía a <a href="https://www.goatcounter.com" target="_blank" rel="noopener noreferrer">GoatCounter</a> un
          aviso anónimo con el número de diputados que suma. No usa cookies ni datos personales.
        </li>
        <li>
          <strong>Memoria del navegador:</strong> para no contar dos veces al mismo diputado, tu navegador guarda la
          lista de diputados a los que ya has escrito. Esa lista no sale de tu dispositivo y se borra al borrar los
          datos de este sitio en tu navegador.
        </li>
        <li>
          <strong>Esta página no instala cookies</strong> ni usa servicios de terceros para mostrarse: las tipografías,
          las fotos y los datos se sirven desde el propio alojamiento.
        </li>
        <li>
          <strong>Alojamiento:</strong>{' '}
          {CONTADOR_EXTERNO
            ? `la web está alojada en el servidor de ${dominio(SITE_URL) || 'la web que la publica'}, y la cifra del contador se lee de un archivo alojado en GitHub Pages. Ambos, como cualquier servidor, pueden registrar datos técnicos de las visitas (por ejemplo, la dirección IP) según sus propias políticas de privacidad.`
            : 'la web está alojada en GitHub Pages. Como cualquier servidor, puede registrar datos técnicos de las visitas (por ejemplo, la dirección IP) según su propia política de privacidad.'}
        </li>
      </ul>

      <h2>Fotos y datos</h2>
      <p>
        Las fotos oficiales y los datos proceden del Congreso de los Diputados, que es su fuente y titular. Se
        reutilizan citando su origen. Si eres diputado o diputada y quieres que se retire tu foto o algún dato, escribe
        al correo de contacto y se hará lo antes posible.
      </p>
    </article>
  );
}
