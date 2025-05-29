// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    base: '/',  // убедитесь, что у вас всегда абсолютные пути на /assets
    plugins: [
      vue(),
      tailwindcss(),

      // PWA плагин — всегда подключен, но в dev режиме будет молчать
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false  // не инжектим SW в dev-сервер
        },
        manifestFilename: 'manifest.json', // браузер запросит именно manifest.json
        includeAssets: [
          'favicon.ico',
          'icons/icon-512x512.png',
          'icons/apple-touch-icon.png'
        ],
        manifest: {
          name: 'Голос победы',
          short_name: 'Голос победы',
          description: 'Сервис для реставрации песен военного времени.',
          theme_color: '#6366f1',
          background_color: '#fafafc',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'apple touch icon' }
          ]
        },
        workbox: {


          // SPA-фоллбэк
          navigateFallback: '/index.html',
          // не отдавать index.html вместо ассетов
          navigateFallbackDenylist: [
            /^\/auth\//,    // любой путь /auth/… → НЕ отдаваться SW
            /^\/api\//,     // если нужно, аналогично для API
            /\.(?:js|css|png|jpe?g|svg|ico|webmanifest)$/

          ],
                    // сразу активировать и взять под контроль страницы
          skipWaiting: true,
          clientsClaim: true,



          runtimeCaching: [
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|ico)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60
                },
              }
            },
            {
              urlPattern: /\.(?:js|css)$/,
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'assets'}

            },
            {
              urlPattern: /\.(?:mp3|wav|ogg)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'audio',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 30 * 24 * 60 * 60
                },
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
    },

    build: {
      sourcemap: false
    }
  }
})
