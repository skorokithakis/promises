import { defineConfig } from 'vitest/config'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Relative base so the build works under any sub-path on any static host.
  base: './',
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      // Precache the favicon and Apple touch icon too (the manifest icons are
      // added automatically).
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Promises',
        short_name: 'Promises',
        description: 'A todo app, except you make promises.',
        display: 'standalone',
        start_url: './',
        scope: './',
        background_color: '#f3f3f0',
        theme_color: '#f3f3f0',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache JS, CSS, HTML and the local fonts. Only woff2: every browser
        // that supports service workers picks it over the woff fallback. The
        // icons are precached through `includeAssets` and the manifest icons.
        globPatterns: ['**/*.{js,css,html,woff2}'],
      },
      // The dev server does not need a service worker.
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
