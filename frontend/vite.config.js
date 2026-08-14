import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: "L'Or Noir — Maison de Parfum",
        short_name: "L'Or Noir",
        description: 'Rare fragrances, hand-composed in small batches.',
        theme_color: '#080F1C',
        background_color: '#080F1C',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            // Product/brand/category browsing works offline from cache;
            // cart, orders, and auth stay network-only (see NetworkOnly
            // exclusion below) since they must never serve stale data.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              /\/api\/v1\/(products|brands|categories)/.test(url.pathname),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'lornoir-catalogue-cache', expiration: { maxEntries: 200, maxAgeSeconds: 3600 } },
          },
          {
            urlPattern: ({ url }) => /\/api\/v1\/(cart|orders|auth|wishlist|addresses|admin|payments)/.test(url.pathname),
            handler: 'NetworkOnly',
          },
        ],
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
