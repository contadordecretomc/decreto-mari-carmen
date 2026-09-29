// Fallback contact for deputies whose congreso.es profile publishes no email:
// the general address of their parliamentary group or, when the group publishes
// none, of their party. Every address was checked by hand on the listed page
// (29/09/2026). Matched by `formacion` (party list the deputy ran on).

export const CONTACTOS_GRUPO = [
  {
    match: /PSOE/,
    nombre: 'Grupo Parlamentario Socialista',
    email: 'ofiprensa@congreso.es',
    fuente: 'https://www.congreso.es/es/grupos/direcciones-de-contacto-grupos',
  },
  {
    match: /^VOX$/,
    nombre: 'Grupo Parlamentario VOX',
    email: 'gpvox@congreso.es',
    fuente: 'https://www.voxespana.es/vox-grupo-parlamentario/contacto-grupo-parlamentario',
  },
  {
    match: /^PP$/,
    nombre: 'Oficina de Atención al Ciudadano del PP',
    email: 'contactapp@pp.es',
    fuente: 'https://www.pp.es/contacto/',
  },
  {
    match: /^ERC$/,
    nombre: 'Esquerra Republicana (sede nacional)',
    email: 'info@esquerra.cat',
    fuente: 'https://www.esquerra.cat/contacta-amb-nosaltres/',
  },
  {
    match: /^BNG$/,
    nombre: 'BNG (sede nacional)',
    email: 'sedenacional@bng.gal',
    fuente: 'https://www.bng.gal/',
  },
  {
    match: /^CCa$/,
    nombre: 'Coalición Canaria Tenerife',
    email: 'prensa@coalicioncanariatenerife.com',
    fuente: 'https://coalicioncanaria.org/sedes/',
  },
];

export function contactoGrupo(formacion) {
  const c = CONTACTOS_GRUPO.find((c) => c.match.test(formacion));
  return c ? { nombre: c.nombre, email: c.email, fuente: c.fuente } : null;
}
