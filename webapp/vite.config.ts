import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: "client",
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./shared"),
      "@client": path.resolve(__dirname, "./client"),
    },
  },
  build: {
    outDir: "../public",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
