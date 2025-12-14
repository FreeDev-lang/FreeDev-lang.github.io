import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
// For GitHub Pages: set base to '/your-repo-name/'
// For custom domain or root deployment: set base to '/'
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    {
      name: 'ensure-nojekyll',
      closeBundle() {
        // Ensure .nojekyll exists in dist root (Vite copies from public, but we ensure it's there)
        const nojekyllPath = join(__dirname, 'dist', '.nojekyll')
        try {
          writeFileSync(nojekyllPath, '')
          console.log('✓ Ensured .nojekyll exists in dist')
        } catch (err) {
          console.warn('Could not create .nojekyll file:', err)
        }
      }
    }
  ],
  build: {
    rollupOptions: {
      output: {
        // Ensure proper file extensions for better MIME type handling
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  },
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

