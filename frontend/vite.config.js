// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Exclude qrcode.react from Vite's dependency pre-bundling
    // to fix the "does not provide an export" error.
    exclude: ['qrcode.react']
  }
});