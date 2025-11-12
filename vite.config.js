import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Benar: Jadikan index.html di root sebagai input utama
      input: 'index.html',
      output: {
        // Jaga nama file tetap konsisten agar sesuai manifest
        entryFileNames: 'main.js',
        assetFileNames: 'main.css',
        chunkFileNames: 'chunk.js',
      },
    },
  },
})