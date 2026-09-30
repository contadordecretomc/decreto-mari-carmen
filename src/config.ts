// Site settings. The VITE_* values come from .env files: the default build
// (GitHub Pages) uses none; `npm run build:externa` reads .env.externa.

const env = import.meta.env;

// GoatCounter site code: for https://micontador.goatcounter.com the code is
// 'micontador'. Empty = nothing is sent (local dev, artifact previews).
export const GOATCOUNTER_CODE = 'contadordecretomc';

// Address shown in the privacy notice for data requests (rectification, removal…).
export const CONTACTO_EMAIL: string = env.VITE_CONTACTO_EMAIL || 'contadordecretomc@gmail.com';

// Organisation that signs the campaign, if any (footer + privacy notice).
export const ORGANIZACION: string = env.VITE_ORGANIZACION || '';

// Where the page reads the counter from. Relative = the copy published next to
// the page; absolute = another site (e.g. the GitHub Pages copy kept up to date
// by the scheduled workflow).
export const CONTADOR_URL: string = env.VITE_CONTADOR_URL || 'data/contador.json';
export const CONTADOR_EXTERNO = /^https?:\/\//.test(CONTADOR_URL);

// Public address of the site, used to name the hosting in the privacy notice.
export const SITE_URL: string = env.VITE_SITE_URL || '';
