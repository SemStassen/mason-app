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

export const createInterfaceViteConfig = () =>
  defineConfig({
    publicDir: path.resolve(__dirname, "public"),
    plugins: [
      devtools(),
      paraglideVitePlugin({
        project: path.resolve(__dirname, "../project.inlang"),
        outdir: path.resolve(__dirname, "src/paraglide"),
      }),
      tanstackRouter({
        target: "react",
        routesDirectory: path.resolve(__dirname, "src/routes"),
        generatedRouteTree: path.resolve(__dirname, "src/routeTree.gen.ts"),
        routeFileIgnorePrefix: "-",
      }),
      tailwindcss(),
      viteReact(),
      babel({
        presets: [reactCompilerPreset()],
      }),
    ],
  });
