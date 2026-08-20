import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Arwa Store',
        short_name: 'Arwa Store',
        description: 'Shop Arwa Store online.',
        theme_color: '#123C35',
        background_color: '#F8F5EE',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'en-PK',
        icons: [
          { src: '/icons/arwa-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/arwa-icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/arwa-maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // API responses are dynamic and may be authenticated. Do not route
        // them through Workbox: a failed request without a cache entry becomes
        // a Workbox "no-response" error instead of an Axios error the app can
        // handle. Static build assets remain precached.
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
});
