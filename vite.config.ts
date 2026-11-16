import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  // relative base: the same build runs on a static host subpath and inside the APK
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // the APK ships its own files, so a cache only delays each update by one launch: its worker unregisters itself
      selfDestroying: mode === 'apk',
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
        background_color: '#f4f2ec',
        theme_color: '#f4f2ec',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
}));
