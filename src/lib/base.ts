import type { Configuracion } from '../config';

// When the site runs inside the WordPress plugin, the page is served at a clean
// address (/decretomaricarmen/) while its files live in the plugin folder. The
// plugin tells the page where they are, plus the settings saved in the WordPress
// admin, through window.__DMC__. Anywhere else, paths are relative as usual.
interface DmcEntorno {
  base?: string;
  config?: Partial<Configuracion>;
}

declare global {
  interface Window {
    __DMC__?: DmcEntorno;
  }
}

const entorno: DmcEntorno = (typeof window !== 'undefined' && window.__DMC__) || {};

/** Folder the site's own files (data/, fotos/, configuracion.json) are served from. */
export const BASE: string = entorno.base || import.meta.env.BASE_URL;

/** Settings injected by the WordPress plugin, if any (otherwise configuracion.json is used). */
export const CONFIG_INYECTADA: Partial<Configuracion> | null = entorno.config ?? null;
