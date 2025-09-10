import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  root: "src",
  // Use a relative base so assets work when loaded from the app bundle (file://)
  base: "./",
  // Prevent Vite from obscuring rust errors
  clearScreen: false,
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
  worker: {
    format: "es",
  },
  server: {
    port: 1420,
    strictPort: true,
    host: host,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // Tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  plugins: [
    tsConfigPaths({
      projects: ["./../../../interface/tsconfig.json"],
    }),
    tailwindcss(),
    viteReact(),
  ],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target:
      process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    // don't minify for debug builds
    minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
});
