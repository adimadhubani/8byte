import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration with React plugin and dev server proxy to backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true
      }
    }
  }
});
