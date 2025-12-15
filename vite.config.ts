import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
// For GitHub Pages: set base to '/your-repo-name/'
// For custom domain or root deployment: set base to '/'
// Check your GitHub Pages URL - if it's username.github.io/repo-name, use '/repo-name/'
// If it's a custom domain at root, use '/'
const getBasePath = () => {
  // Check environment variable first
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH;
  }
  // Default to root for custom domains
  return '/';
};

export default defineConfig({
  base: getBasePath(),
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
    },
    {
      name: 'fix-mime-types',
      transformIndexHtml(html) {
        // Ensure script tags have proper type="module" attribute (only if not already present)
        return html.replace(
          /<script(?![^>]*type=)([^>]*?)src="([^"]*\.js)"([^>]*?)>/gi,
          '<script$1type="module" src="$2"$3>'
        ).replace(
          /type="module"\s+type="module"/gi,
          'type="module"'
        )
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure files are served with correct extensions
    rollupOptions: {
      output: {
        // Ensure proper file extensions for better MIME type handling
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/img/[name]-[hash].[ext]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash].[ext]`;
          }
          return `assets/[name]-[hash].[ext]`;
        },
        // Ensure proper module format
        format: 'es'
      }
    },
    // Ensure proper MIME types
    assetsInlineLimit: 4096,
    // Use esbuild for minification (default, faster)
    minify: 'esbuild',
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

