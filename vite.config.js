import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import {VitePWA} from "vite-plugin-pwa";


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Автоматическое обновление сервис-воркера
      devOptions: {
        enabled: true // Включает PWA в режиме разработки (удобно для тестов)
      },
      includeAssets: ['favicon.ico', 'icons/icon-512x512.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Голос победы', // Полное название приложения
        short_name: 'Голос победы', // Короткое название для иконки на главном экране
        description: 'Сервис для реставрации песен военного времени.',
        theme_color: '#6366f1', // --color-light-primary (индиго) для светлой темы
        background_color: '#fafafc', // --color-light-bg для светлой темы
        display: 'standalone', // Полноэкранный режим без браузерной строки
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icons/apple-touch-icon.png', // Создайте эту иконку (180x180)
            sizes: '180x180',
            type: 'image/png',
            purpose: 'apple touch icon'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallbackAllowlist: [/^\/callback/],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 дней
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets'
            }
          },
          {
            urlPattern: /\.(?:mp3|wav|ogg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 дней
              }
            }
          }
        ]
      }
    })


  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // разрешить любые хосты (в режиме разработки)
    // либо явно перечислить: ['frontend', 'localhost', 'голос-победы.рф']
  allowedHosts: [
    'frontend',
    'localhost',
    'голос-победы.рф',
    'xn----btbege7aubbju0k.xn--p1ai'
  ]

  },
})
