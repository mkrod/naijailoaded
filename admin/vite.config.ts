import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
import { readFileSync } from 'fs';

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  server: {
    host: true,
    https: {
      key: readFileSync(path.resolve(__dirname, "./keys/localhost+1-key.pem")),
      cert: readFileSync(path.resolve(__dirname, "./keys/localhost+1.pem")),
    },
    port: 5180,
  },
});