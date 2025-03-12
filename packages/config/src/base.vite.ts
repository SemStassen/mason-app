import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
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
  optimizeDeps: {
    // See: https://pglite.dev/docs/bundler-support#vite
    exclude: ["@electric-sql/pglite"],
  },
  plugins: [
    i18nextLoader({
      paths: [fileURLToPath(url.href)],
      namespaceResolution: "relativePath",
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
