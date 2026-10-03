/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  // runonweb ships TS sources and loads its WebGPU engine lazily; let Vite serve it as-is
  optimizeDeps: {
    exclude: ['runonweb'],
  },
  build: {
    outDir: 'build',
    target: 'es2022',
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
