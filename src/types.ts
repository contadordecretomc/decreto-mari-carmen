export interface Diputado {
  id: number;
  nombre: string;
  apellidos: string;
  genero: 'f' | 'm';
  circunscripcion: string;
  formacion: string;
  grupo: string;
  email: string | null;
  foto: string | null;
  ficha: string;
}

export interface DiputadosData {
  actualizado: string;
  legislatura: number;
  diputados: Diputado[];
}
