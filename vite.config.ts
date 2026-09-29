import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the built dist/ works from any static host or subpath
  // (GitHub Pages, Netlify, a plain folder).
  base: './',
  server: {
    // Fixed, uncommon port so this project never collides with other local
    // dev servers or Vite's shared 5173 default.
    port: 5902,
    strictPort: true,
  },
})
