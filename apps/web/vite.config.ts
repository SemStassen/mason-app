import path from "node:path";
import { fileURLToPath } from "node:url";

import { paraglideVitePlugin } from "@inlang/paraglide-js";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "src",
  envDir: "..",
  clearScreen: false,
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 8002,
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
    devtools(),
    paraglideVitePlugin({
      project: path.resolve(__dirname, "../../project.inlang"),
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
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
  build: {
    outDir: "../dist",
    assetsDir: ".",
  },
});
