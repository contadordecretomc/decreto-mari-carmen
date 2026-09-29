// The artifact build embeds photos as data: URIs; the site serves them as files.
export function fotoSrc(foto: string) {
  return foto.startsWith('data:') ? foto : import.meta.env.BASE_URL + foto;
}

export const fichaHash = (id: number) => `#d-${id}`;
