import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.js'],
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
  server: {
    port: 5173,
    fs: {
      // allow importing ../shared/demo-data.js in dev
      allow: ['..'],
    },
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
