import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
