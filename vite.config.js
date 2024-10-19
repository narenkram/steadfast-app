import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    base: '/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        '/flattradeSymbols': {
          target: isProduction ? 'https://api.steadfastapp.in' : 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/flattradeSymbols/, '/flattrade/')
        },
        '/shoonyaSymbols': {
          target: isProduction ? 'https://api.steadfastapp.in' : 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/shoonyaSymbols/, '/shoonya/')
        },
        '/flattradeApi': {
          target: 'https://authapi.flattrade.in',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/flattradeApi/, '')
        },
        '/shoonyaApi': {
          target: 'https://api.shoonya.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/shoonyaApi/, '')
        },
        '/api': {
          target: isProduction ? 'https://api.steadfastapp.in' : 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    optimizeDeps: {
      include: ['@google/generative-ai']
    },
    define: {
      'process.env.BASE_URL': isProduction
        ? JSON.stringify('https://api.steadfastapp.in')
        : JSON.stringify('http://localhost:3000')
    }
  }
})
