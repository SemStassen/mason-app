import { createInterfaceViteConfig } from "@mason/interface/vite";
import { defineConfig, mergeConfig } from "vite";

export default mergeConfig(
  createInterfaceViteConfig(),
  defineConfig({
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
      exclude: [],
    },
    worker: {
      format: "es",
    },
    define: {
      __PLATFORM__: JSON.stringify("web"),
    },
    build: {
      outDir: "../dist",
    },
  })
);
