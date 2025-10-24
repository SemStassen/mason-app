import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "src",
  clearScreen: false,
  server: {
    port: 8002,
    proxy: {
      "/api": {
        target: "http://localhost:8001",
        changeOrigin: true,
      },
    },
  },

  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
  worker: {
    format: "es",
  },
  define: {
    __PLATFORM__: JSON.stringify("web"),
  },
  plugins: [
    tsConfigPaths({
      projects: [
        path.resolve(__dirname, "../../interface/tsconfig.json"),
        path.resolve(__dirname, "../../packages/api-contract/tsconfig.json"),
      ],
    }),
    paraglideVitePlugin({
      project: path.resolve(__dirname, "../../interface/project.inlang"),
      outdir: path.resolve(__dirname, "../../interface/src/paraglide"),
    }),
    tanstackRouter({
      target: "react",
      routesDirectory: path.resolve(__dirname, "../../interface/src/routes"),
      generatedRouteTree: path.resolve(
        __dirname,
        "../../interface/src/routeTree.gen.ts"
      ),
      routeFileIgnorePrefix: "-",
    }),
    tailwindcss(),
    viteReact(),
  ],
  build: {
    outDir: "../dist",
    assetsDir: ".",
  },
});
