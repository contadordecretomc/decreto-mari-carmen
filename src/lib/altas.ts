// Voluntary sign-up to receive information from the organisations behind the
// campaign. Nothing is collected by the site: the button opens the person's own
// mail app with a message addressed to the campaign inbox, which they send
// themselves. The email states who keeps the address and who it is shared with,
// and it only names the organisations the person ticked (consent per purpose).
import campana from '../../campana.config.json';

export interface Organizacion {
  id: string;
  nombre: string;
  corto?: string;
  correo: string;
  /** 'el' for names that take an article in Spanish ("del Sindicato…"). */
  articulo: string;
}

export const ALTAS = campana.altas as { buzon: string; gestiona: string; organizaciones: Organizacion[] };

const de = (o: Organizacion, corto = false) => `${o.articulo === 'el' ? 'del' : 'de'} ${corto && o.corto ? o.corto : o.nombre}`;
const a = (o: Organizacion) => `${o.articulo === 'el' ? 'al' : 'a'} ${o.nombre}`;
const sujeto = (o: Organizacion) => (o.articulo === 'el' ? `El ${o.nombre}` : o.nombre);

export function mensajeAlta(elegidas: Organizacion[]) {
  const gestora = ALTAS.organizaciones.find((o) => o.nombre === ALTAS.gestiona);
  const otras = elegidas.filter((o) => o.nombre !== ALTAS.gestiona);
  const gestoraElegida = elegidas.some((o) => o.nombre === ALTAS.gestiona);

  const subject = `Alta para recibir información ${elegidas.map((o) => de(o, true)).join(' y ')}`;

  const cesion = otras.length
    ? ` y que la comunique ${otras.map(a).join(' y ')} para que ${otras.length > 1 ? 'puedan' : 'pueda'} enviarme su información`
    : '';
  const uso =
    elegidas.length > 1
      ? 'Cada organización usará mi correo solo para informarme de sus actividades y campañas.'
      : `${sujeto(elegidas[0])} usará mi correo solo para informarme de sus actividades y campañas.${
          !gestoraElegida ? ` ${ALTAS.gestiona} no lo usará para nada más.` : ''
        }`;
  // Rights can always be exercised with whoever keeps the address (the campaign).
  const contactos = [gestora, ...otras].filter((o): o is Organizacion => !!o);

  const body = [
    'Hola:',
    '',
    `Quiero recibir información de ${elegidas.length > 1 ? 'las siguientes organizaciones' : 'la siguiente organización'} en esta dirección de correo:`,
    '',
    ...elegidas.map((o) => `– ${o.nombre} (${o.correo})`),
    '',
    `Envío este correo a la campaña del Decreto Mari Carmen, gestionada por ${ALTAS.gestiona}. Entiendo y acepto que ${ALTAS.gestiona} guarde mi dirección para este fin${cesion}. ${uso}`,
    '',
    `Sé que puedo darme de baja o ejercer mis derechos en cualquier momento escribiendo a ${contactos
      .map((o) => `${o.correo} (${o.corto ?? o.nombre})`)
      .join(' o a ')}.`,
    '',
  ].join('\n');

  return { to: ALTAS.buzon, subject, body };
}

export function mailtoAlta(m: { to: string; subject: string; body: string }) {
  return `mailto:${m.to}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`;
}
