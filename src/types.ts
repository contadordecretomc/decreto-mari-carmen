export interface ContactoGrupo {
  nombre: string;
  email: string;
  fuente: string;
}

export interface Diputado {
  id: number;
  nombre: string;
  apellidos: string;
  genero: 'f' | 'm';
  circunscripcion: string;
  formacion: string;
  grupo: string;
  email: string | null;
  /** Group/party address, only when the deputy publishes no email of their own. */
  contactoGrupo: ContactoGrupo | null;
  biografia: string | null;
  /** dd/mm/yyyy, from Congreso open data. */
  fechaAlta: string | null;
  foto: string | null;
  ficha: string;
}

export interface DiputadosData {
  actualizado: string;
  legislatura: number;
  diputados: Diputado[];
}

export interface ContadorData {
  /** Deputies written to from this site (one email × one deputy = 1). */
  correos: number;
  actualizado: string | null;
}
