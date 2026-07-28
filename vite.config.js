import { defineConfig } from 'vite';

export default defineConfig({
  // './' ensures assets use relative paths — required for GitHub Pages
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true,
  },
});
