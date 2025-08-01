import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../backend/staticfiles'),
    emptyOutDir: true,
    manifest: true,
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': 'http://localhost:8000',
    },
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },
})
