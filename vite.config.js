import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Server configuration
  server: {
    port: 3000,
    open: true,
    host: true
  },

  // Build configuration
  build: {
    outDir: 'build',
    sourcemap: true,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['papaparse']
        }
      }
    }
  },

  // Public directory
  publicDir: 'public',

  // Resolve configuration
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  }
})
