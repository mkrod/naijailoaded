import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync, existsSync } from 'fs';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5180,
    ...(isDev && existsSync(path.resolve(__dirname, "./keys/localhost+1-key.pem")) && {
      https: {
        key: readFileSync(path.resolve(__dirname, "./keys/localhost+1-key.pem")),
        cert: readFileSync(path.resolve(__dirname, "./keys/localhost+1.pem")),
      },
    }),
  },
});