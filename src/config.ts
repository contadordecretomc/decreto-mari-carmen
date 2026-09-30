// Fixed settings, compiled into the site. Everything that can change between
// hosts (contact email, organisation) lives in public/configuracion.json, which
// is read at runtime, so the built folder can be uploaded anywhere as is.

// GoatCounter site code: for https://micontador.goatcounter.com the code is
// 'micontador'. Empty = nothing is sent (local dev, artifact previews).
export const GOATCOUNTER_CODE = 'contadordecretomc';

// The counter is always read from the GitHub Pages copy, which the scheduled
// workflow refreshes every 10 minutes. The copy uploaded with the page
// (data/contador.json) is the fallback.
export const CONTADOR_URL = 'https://contadordecretomc.github.io/decreto-mari-carmen/data/contador.json';

// Defaults when configuracion.json is missing or unreadable.
export interface Configuracion {
  correoContacto: string;
  organizacion: string;
}

export const CONFIG_POR_DEFECTO: Configuracion = {
  correoContacto: 'contadordecretomc@gmail.com',
  organizacion: '',
};
