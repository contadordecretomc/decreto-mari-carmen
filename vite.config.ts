import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

// Link previews (Open Graph / Twitter Card). They need absolute URLs, so they
// are only injected when VITE_SITE_URL is set (see .env.externa).
function vistaPrevia(siteUrl: string): Plugin {
  return {
    name: 'vista-previa-redes',
    transformIndexHtml(html) {
      if (!siteUrl) return html
      const url = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`
      const title = 'Que no dejen caer el Decreto Mari Carmen'
      const desc = '350 caras. Una votación. Escribe a tus diputados para que voten a favor de convalidar el Decreto Mari Carmen.'
      const img = `${url}compartir.png`
      const tags = [
        `<link rel="canonical" href="${url}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:url" content="${url}" />`,
        `<meta property="og:title" content="${title}" />`,
        `<meta property="og:description" content="${desc}" />`,
        `<meta property="og:image" content="${img}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="675" />`,
        `<meta property="og:locale" content="es_ES" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${title}" />`,
        `<meta name="twitter:description" content="${desc}" />`,
        `<meta name="twitter:image" content="${img}" />`,
      ]
      return html.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  if (mode === 'externa' && /webdeejemplo\.com/.test(env.VITE_SITE_URL ?? '')) {
    console.warn('\n⚠  .env.externa todavía tiene la dirección de ejemplo (webdeejemplo.com). Cámbiala antes de publicar.\n')
  }
  return {
    plugins: [react(), vistaPrevia(env.VITE_SITE_URL ?? '')],
    // Default: relative base, so dist/ works from any folder (GitHub Pages).
    // `npm run build:externa` sets an absolute base (e.g. /decretomaricarmen/)
    // so the page also works when opened without the trailing slash.
    base: env.VITE_BASE || './',
    build: {
      outDir: mode === 'externa' ? 'dist-externa' : 'dist',
    },
    server: {
      // Fixed, uncommon port so this project never collides with other local
      // dev servers or Vite's shared 5173 default.
      port: 5902,
      strictPort: true,
    },
  }
})
