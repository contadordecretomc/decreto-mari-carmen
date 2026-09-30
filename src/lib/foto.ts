import { BASE } from './base';

// The artifact build embeds photos as data: URIs; the site serves them as files.
export function fotoSrc(foto: string) {
  return foto.startsWith('data:') ? foto : BASE + foto;
}

export const fichaHash = (id: number) => `#d-${id}`;
