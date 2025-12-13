import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // Show install prompt
      injectRegister: 'auto', // Auto-inject service worker registration
      includeAssets: ['favicon.ico', 'vite.svg'],
      strategies: 'generateSW', // Generate service worker
      devOptions: {
        enabled: true, // Enable PWA in dev mode
        type: 'module'
      },
      manifest: {
        name: 'Project Aegis - Disaster Response',
        short_name: 'Aegis',
        description: 'Offline-First Disaster Response System',
        theme_color: '#667eea',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        id: '/',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        // Cache all navigation requests (SPA routes) to index.html
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        // Use CacheFirst for navigation to ensure offline works
        navigationPreload: false, // Disable navigation preload to let service worker handle it
        runtimeCaching: [
          // Cache navigation requests with CacheFirst (critical for offline)
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'CacheFirst',
            options: {
              cacheName: 'navigation-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'openstreetmap-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          // Cache API requests with NetworkFirst strategy
          {
            urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-cache',
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'googleapis-cache',
              networkTimeoutSeconds: 10
            }
          }
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true, // Take control of clients immediately
        skipWaiting: true // Activate service worker immediately
      }
    })
  ],
})
