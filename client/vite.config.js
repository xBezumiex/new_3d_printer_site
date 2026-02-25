import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE_PATH задаётся при сборке:
//   - Docker / локально:   VITE_BASE_PATH=/   (по умолчанию)
//   - GitHub Pages:        VITE_BASE_PATH=/3d_printer_site/
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
