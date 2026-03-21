import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
  build: {
    target: 'es2015',
    minify: 'esbuild',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — грузится первым, кешируется надолго
          'react-core': ['react', 'react-dom'],
          // React Router
          'react-router': ['react-router-dom'],
          // Three.js — большой, только для /upload
          'three-core': ['three'],
          // Утилиты
          'ui-libs': ['axios', 'react-hot-toast', 'react-hook-form', 'lucide-react'],
        },
      },
    },
  },
})
