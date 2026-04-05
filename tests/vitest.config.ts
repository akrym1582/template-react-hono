import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

const testsDir = path.resolve(__dirname);

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    root: testsDir,
    include: ["unit/**/*.test.{ts,tsx}"],
    setupFiles: [path.resolve(testsDir, "setup.ts")],
    alias: {
      "@shared": path.resolve(testsDir, "../webapp/shared"),
      "@client": path.resolve(testsDir, "../webapp/client"),
      "@server": path.resolve(testsDir, "../webapp/server"),
    },
  },
});
