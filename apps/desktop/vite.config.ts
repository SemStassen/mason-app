import { createInterfaceViteConfig } from "@mason/interface/vite";
import { defineConfig, mergeConfig } from "vite";

const host = process.env.TAURI_DEV_HOST;

export default mergeConfig(
  createInterfaceViteConfig(),
  defineConfig({
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
      exclude: [],
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
    build: {
      // Tauri uses Chromium on Windows and WebKit on macOS and Linux
      target:
        process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
      // don't minify for debug builds
      minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
      // produce sourcemaps for debug builds
      sourcemap: !!process.env.TAURI_ENV_DEBUG,
    },
  })
);
