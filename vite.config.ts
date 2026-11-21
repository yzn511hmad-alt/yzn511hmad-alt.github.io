import { defineConfig, type Plugin } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { losslessDelivery } from './scripts/lossless-delivery.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Injects <link rel="modulepreload"> into built pricing.html for the lazy
 * PricingJourney chunk and its static imports (vendor-three, vendor-gsap, etc.)
 * so the HTML preload scanner fetches the 3D scene in parallel at t=0.
 */
function pricingModulePreload(): Plugin {
  return {
    name: 'snowy-pricing-modulepreload',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle || !ctx.filename.endsWith('pricing.html')) return html;
        const journey = Object.values(ctx.bundle).find(
          (item) => item.type === 'chunk' && item.name === 'PricingJourney',
        );
        if (!journey || journey.type !== 'chunk') return html;
        const seen = new Set<string>();
        const queue = [journey.fileName, ...journey.imports];
        const links: string[] = [];
        while (queue.length) {
          const file = queue.shift()!;
          if (seen.has(file)) continue;
          seen.add(file);
          const href = '/' + file;
          if (!html.includes(`href="${href}"`)) {
            links.push(`<link rel="modulepreload" crossorigin href="${href}">`);
          }
          const chunk = ctx.bundle[file];
          if (chunk && chunk.type === 'chunk') {
            for (const dep of chunk.imports) queue.push(dep);
          }
        }
        return links.length ? html.replace('</head>', `  ${links.join('\n  ')}\n</head>`) : html;
      },
    },
  };
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  optimizeDeps: { entries: ['*.html'] },
  plugins: [pricingModulePreload(), losslessDelivery()],
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
