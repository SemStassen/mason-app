import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import i18nextLoader from "vite-plugin-i18next-loader";
import tsconfigPaths from "vite-tsconfig-paths";

const url = new URL("../../interface/locales", import.meta.url);

export default defineConfig({
  clearScreen: false,
  root: "src",
  build: {
    outDir: "../dist",
    assetsDir: ".",
  },
  server: {
    port: 8002,
  },
  resolve: {},
  worker: {
    format: "es",
  },
  optimizeDeps: {
    // See: https://pglite.dev/docs/bundler-support#vite
    exclude: ["@electric-sql/pglite"],
  },
  plugins: [
    process.env.PACKAGE_TYPE === "app" &&
      TanStackRouterVite({
        routesDirectory: "../../interface/src/app/routes",
        generatedRouteTree: "../../interface/src/app/routeTree.gen.ts",
      }),
    i18nextLoader({
      paths: [fileURLToPath(url.href)],
      namespaceResolution: "relativePath",
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
