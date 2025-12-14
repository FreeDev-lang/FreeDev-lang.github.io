import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// For GitHub Pages: set base to '/your-repo-name/'
// For custom domain or root deployment: set base to '/'
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/fria-frontend/',
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

