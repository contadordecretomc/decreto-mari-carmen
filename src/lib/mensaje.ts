import type { Diputado } from '../types';

export const VOTACION = 'este viernes, 2 de octubre';

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

/** Addresses for a bulk email: own address, or the group/party inbox (deduped). */
export function direcciones(ds: Diputado[]): { emails: string[]; viaGrupo: Diputado[] } {
  const emails = new Set<string>();
  const viaGrupo: Diputado[] = [];
  for (const d of ds) {
    if (d.email) emails.add(d.email);
    else if (d.contactoGrupo) {
      emails.add(d.contactoGrupo.email);
      viaGrupo.push(d);
    }
  }
  return { emails: [...emails], viaGrupo };
}

export function mensajeColectivo(ds: Diputado[]): { cc: string[]; subject: string; body: string } {
  const { emails, viaGrupo } = direcciones(ds);
  const subject = 'Voten a favor del Decreto Mari Carmen este viernes';
  const body = [
    'Estimadas diputadas y estimados diputados:',
    '',
    `Les escribo para pedirles que ${VOTACION} voten a favor de convalidar los dos reales decretos de vivienda conocidos como "Decreto Mari Carmen", aprobados hoy por el Consejo de Ministros.`,
    '',
    'Mari Carmen tiene 87 años y fue desahuciada en Madrid. Estos decretos prorrogan la protección frente a los desahucios, regulan los alquileres de temporada y por habitaciones, frenan la compra de vivienda por fondos buitre y alargan los contratos de alquiler que vencen en los próximos años. Les pido que no dejen caer estas medidas.',
    '',
    // Group/party inboxes need to know who to forward it to.
    ...(viaGrupo.length
      ? [`A las oficinas de grupo o partido: les ruego que hagan llegar este mensaje a ${viaGrupo.map(nombreCompleto).join(', ')}.`, '']
      : []),
    'Un saludo,',
    '',
  ].join('\n');
  return { cc: emails, subject, body };
}

export function mailtoCcHref(m: { cc: string[]; subject: string; body: string }): string {
  return `mailto:?cc=${m.cc.map(encodeURIComponent).join(',')}&subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`;
}
