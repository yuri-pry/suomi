import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // relative base: the same build runs on a static host subpath and inside the APK
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // precache everything, unit content chunks included, so lessons work offline
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg,woff2}'] },
      manifest: {
        name: 'Suomi',
        short_name: 'Suomi',
        description: 'Learn Finnish in short lessons',
        lang: 'en',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#f8f7f3',
        theme_color: '#f8f7f3',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
