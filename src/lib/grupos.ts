// Parliamentary groups in hemicycle order (left → right, as seen from the
// presidency), with the short label and seat colour used across the site.
export interface GrupoInfo {
  id: string;
  grupo: string;
  corto: string;
  color: string;
}

export const GRUPOS: GrupoInfo[] = [
  { id: 'psoe', grupo: 'Grupo Parlamentario Socialista', corto: 'PSOE', color: '#d8323a' },
  { id: 'sumar', grupo: 'Grupo Parlamentario Plurinacional SUMAR', corto: 'Sumar', color: '#d9437f' },
  { id: 'erc', grupo: 'Grupo Parlamentario Republicano', corto: 'ERC', color: '#f0ae1d' },
  { id: 'bildu', grupo: 'Grupo Parlamentario Euskal Herria Bildu', corto: 'EH Bildu', color: '#9dc32a' },
  { id: 'mixto', grupo: 'Grupo Parlamentario Mixto', corto: 'Mixto', color: '#9aa39d' },
  { id: 'pnv', grupo: 'Grupo Parlamentario Vasco (EAJ-PNV)', corto: 'PNV', color: '#2e7a45' },
  { id: 'junts', grupo: 'Grupo Parlamentario Junts per Catalunya', corto: 'Junts', color: '#2bb3a6' },
  { id: 'pp', grupo: 'Grupo Parlamentario Popular en el Congreso', corto: 'PP', color: '#1f7fc7' },
  { id: 'vox', grupo: 'Grupo Parlamentario VOX', corto: 'VOX', color: '#5aae2e' },
];

const FALLBACK: GrupoInfo = { id: 'otro', grupo: '', corto: '', color: '#9aa39d' };

export function grupoInfo(grupo: string): GrupoInfo {
  return (
    GRUPOS.find((g) => g.grupo === grupo) ?? { ...FALLBACK, grupo, corto: grupo.replace(/^Grupo Parlamentario /, '') }
  );
}

export function grupoCorto(grupo: string): string {
  return grupoInfo(grupo).corto;
}
