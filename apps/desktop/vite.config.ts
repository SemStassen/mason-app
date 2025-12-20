import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const host = process.env.TAURI_DEV_HOST;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  define: {
    __PLATFORM__: JSON.stringify("desktop"),
  },
  plugins: [
    tsConfigPaths({
      projects: [
        path.resolve(__dirname, "../../interface/tsconfig.json"),
        path.resolve(__dirname, "../../packages/api-contract/tsconfig.json"),
      ],
    }),
    tailwindcss(),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
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
