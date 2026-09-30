import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Campaign-specific values (GoatCounter code, GitHub Pages address, default
// contact email). The one file to edit in a fork.
const campana = JSON.parse(readFileSync(new URL('./campana.config.json', import.meta.url), 'utf8'))

function datosCampana(): Plugin {
  return {
    name: 'datos-campana',
    // Link-preview image, served from the GitHub Pages copy so it works on any host.
    transformIndexHtml: (html) => html.replaceAll('%COMPARTIR_IMAGEN%', `${campana.githubPages}compartir.png`),
    // configuracion.json: the file people edit after uploading the folder.
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'configuracion.json',
        source:
          JSON.stringify(
            {
              _instrucciones:
                'Único archivo que hay que editar al subir la web a otro sitio. correoContacto: correo para consultas y solicitudes de datos (aparece en el aviso de privacidad). organizacion: nombre de quien firma la campaña; déjalo vacío si no firma nadie.',
              correoContacto: campana.correoContacto,
              organizacion: '',
            },
            null,
            2
          ) + '\n',
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), datosCampana()],
  // Relative base: the built folder works from any domain and any subfolder
  // (GitHub Pages, https://webdeejemplo.com/decretomaricarmen/, a local folder).
  // index.html adds the trailing slash when it's missing.
  base: './',
  server: {
    // Fixed, uncommon port so this project never collides with other local
    // dev servers or Vite's shared 5173 default.
    port: 5902,
    strictPort: true,
  },
})
