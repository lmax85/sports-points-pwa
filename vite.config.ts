import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['.ngrok-free.app'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sports Points Tracker',
        short_name: 'Points',
        description: 'Track team points for sports events',
        theme_color: '#1a73e8',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        screenshots: [
          {
            src: '/screenshot-narrow.png',
            sizes: '1290x2796',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Sports Points Tracker',
          },
          {
            src: '/screenshot-wide.png',
            sizes: '2796x1290',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Sports Points Tracker',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,ico,svg}'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
