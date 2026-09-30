// Fixed settings, compiled into the site. The campaign-specific values live in
// campana.config.json (the one file to edit in a fork). What can change between
// hosts (contact email, organisation) is read at runtime from configuracion.json
// or from the WordPress plugin settings, so the built site needs no rebuild.
import campana from '../campana.config.json';

// GoatCounter site code: for https://micontador.goatcounter.com the code is
// 'micontador'. Empty = nothing is sent (local dev, forks not yet configured).
export const GOATCOUNTER_CODE: string = campana.goatcounter;

// The counter is always read from the GitHub Pages copy, which the scheduled
// workflow refreshes every 10 minutes. The copy uploaded with the page
// (data/contador.json) is the fallback.
export const CONTADOR_URL = `${campana.githubPages}data/contador.json`;

// Defaults when configuracion.json is missing or unreadable.
export interface Configuracion {
  correoContacto: string;
  organizacion: string;
}

export const CONFIG_POR_DEFECTO: Configuracion = {
  correoContacto: campana.correoContacto,
  organizacion: '',
};
