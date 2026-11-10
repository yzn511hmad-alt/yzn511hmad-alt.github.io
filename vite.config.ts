import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { losslessDelivery } from './scripts/lossless-delivery.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: '.',
  publicDir: 'public',
  optimizeDeps: { entries: ['*.html'] },
  plugins: [losslessDelivery()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
    host: true,
    watch: {
      // Prevent EBUSY / resource-locked crashes on Windows when
      // Vite tries to watch large binary 3D model files (GLB, etc.)
      ignored: ['**/*.glb', '**/dist/**', '**/.git/**', '**/work/**'],
      usePolling: false,
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        scripts: resolve(__dirname, 'scripts.html'),
        freeKey: resolve(__dirname, 'free-key.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/gsap')) {
            return 'vendor-gsap';
          }
          if (id.includes('node_modules/lenis')) {
            return 'vendor-lenis';
          }
        },
      },
    },
  },
});
