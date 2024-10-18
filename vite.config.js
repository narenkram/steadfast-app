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
        '/flattradeSymbols': 'http://localhost:3000/flattrade/',
        '/shoonyaSymbols': 'http://localhost:3000/shoonya/',
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
        '/flattrade': {
          target: 'http://localhost:3000', // Or your production API URL
          changeOrigin: true
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
