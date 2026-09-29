import type { Diputado } from '../types';

export const VOTACION = 'este viernes, 2 de octubre';

const GRUPOS_CORTOS: Record<string, string> = {
  'Grupo Parlamentario Popular en el Congreso': 'PP',
  'Grupo Parlamentario Socialista': 'PSOE',
  'Grupo Parlamentario VOX': 'VOX',
  'Grupo Parlamentario Plurinacional SUMAR': 'Sumar',
  'Grupo Parlamentario Republicano': 'ERC',
  'Grupo Parlamentario Junts per Catalunya': 'Junts',
  'Grupo Parlamentario Euskal Herria Bildu': 'EH Bildu',
  'Grupo Parlamentario Vasco (EAJ-PNV)': 'PNV',
  'Grupo Parlamentario Mixto': 'Mixto',
};

export function grupoCorto(grupo: string): string {
  return GRUPOS_CORTOS[grupo] ?? grupo.replace(/^Grupo Parlamentario /, '');
}

export function nombreCompleto(d: Diputado): string {
  return `${d.nombre} ${d.apellidos}`;
}

export interface Mensaje {
  to: string;
  subject: string;
  body: string;
}

export function mensaje(d: Diputado): Mensaje | null {
  const to = d.email ?? d.contactoGrupo?.email;
  if (!to) return null;
  const f = d.genero === 'f';
  const subject = d.email
    ? 'Vote a favor del Decreto Mari Carmen este viernes'
    : `Para ${d.nombre} ${d.apellidos}: vote a favor del Decreto Mari Carmen este viernes`;
  const body = [
    // Group/party inboxes need to know who the message is for.
    ...(d.email ? [] : [`A la atención ${f ? 'de la diputada' : 'del diputado'} ${d.nombre} ${d.apellidos}`, '']),
    `${f ? 'Estimada' : 'Estimado'} ${d.nombre} ${d.apellidos}:`,
    '',
    `Le escribo como ciudadano/a para pedirle que ${VOTACION} vote a favor de convalidar en el Congreso los dos reales decretos de vivienda conocidos como "Decreto Mari Carmen", aprobados hoy por el Consejo de Ministros.`,
    '',
    'Mari Carmen tiene 87 años y fue desahuciada en Madrid. Su caso no es una excepción: miles de familias viven con miedo a perder su casa. Estos decretos prorrogan la protección frente a los desahucios de personas vulnerables, regulan los alquileres de temporada y por habitaciones, frenan la compra de vivienda por fondos buitre y alargan los contratos de alquiler que vencen en los próximos años.',
    '',
    `Como ${f ? 'diputada' : 'diputado'} por ${d.circunscripcion}, su voto cuenta. Le pido que no deje caer estas medidas.`,
    '',
    'Un saludo,',
    '',
  ].join('\n');
  return { to, subject, body };
}

export function mailtoHref(m: Mensaje): string {
  return `mailto:${m.to}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`;
}
