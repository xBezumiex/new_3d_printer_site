import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      base,
      workbox: {
        // Кешируем только статику — JS/CSS/HTML/шрифты/иконки
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        // API-запросы НЕ кешируем через SW — axios сам управляет ретраями
        runtimeCaching: [],
        // Вытесняем старый SW немедленно, чтобы убрать устаревшую API-кеш-логику
        skipWaiting: true,
        clientsClaim: true,
        // SPA: 404 для /posts, /courses и т.д. → отдаём index.html
        navigateFallback: 'index.html',
        // Не применяем navigateFallback к API-запросам
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: '3D Print Lab',
        short_name: '3D Print',
        description: 'Профессиональная 3D-печать',
        theme_color: '#FF4D00',
        background_color: '#080810',
        display: 'standalone',
        start_url: base,
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
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
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'three-core': ['three'],
          'ui-libs': ['axios', 'react-hot-toast', 'react-hook-form', 'lucide-react'],
        },
      },
    },
  },
})
