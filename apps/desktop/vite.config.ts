import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  root: "src",
  envDir: "..",
  // Use a relative base so assets work when loaded from the app bundle (file://)
  base: "./",
  // Prevent Vite from obscuring rust errors
  clearScreen: false,
  resolve: {
    tsconfigPaths: true,
  },
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
  define: {
    __PLATFORM__: JSON.stringify("desktop"),
  },
  plugins: [
    tailwindcss(),
    viteReact(),
    babel({
      presets: [reactCompilerPreset()],
    }),
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
