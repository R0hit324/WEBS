import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Sourcemaps only ship when explicitly requested (local debugging):
    // set BUILD_SOURCESMAP=1 to generate .map files (never enabled by default,
    // shipping .map files to production exposes application source code).
    sourcemap: process.env.BUILD_SOURCESMAP === '1',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        // Split vendored libraries out of the main chunk. Runtime behavior is
        // unchanged — the chunks load in the same order from the same
        // index.html — but the single-entry warning threshold is no longer
        // crossed and browsers can cache the vendor payload independently.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@supabase')) return 'vendor-supabase';
          return undefined;
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  preview: {
    port: 3000,
    open: true
  },
  css: {
    devSourcemap: true
  }
});