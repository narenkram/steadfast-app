import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/symbols': 'http://localhost:3000',
      '/api': {
        target: 'https://authapi.flattrade.in',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
})
