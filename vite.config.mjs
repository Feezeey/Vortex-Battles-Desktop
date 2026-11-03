import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: './',
  publicDir: false,
  build: { outDir: '../dist', emptyOutDir: true, assetsInlineLimit: 0 },
  server: { port: 1420, strictPort: true, host: '127.0.0.1' },
  clearScreen: false
});
