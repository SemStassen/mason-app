import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

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
  build: {
    outDir: "../dist",
    assetsDir: ".",
  },
  optimizeDeps: {
    exclude: ["@electric-sql/pglite"],
  },
  worker: {
    format: "es",
  },
  plugins: [
    tsConfigPaths({
      projects: [
        "./../../../interface/tsconfig.json",
        "./../../../packages/core/tsconfig.json",
      ],
    }),
    paraglideVitePlugin({
      project: "./../../interface/project.inlang",
      outdir: "./../../interface/src/paraglide",
    }),
    // tanstackStart({ customViteReactPlugin: true }),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./../../interface/src/routes",
      generatedRouteTree: "./../../interface/src/routeTree.gen.ts",
      routeFileIgnorePrefix: "-",
    }),
    tailwindcss(),
    viteReact(),
  ],
});
