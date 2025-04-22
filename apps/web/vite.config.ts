import { mergeConfig } from "vite";

/**
 * Aliased imports do not seem to work here
 */
import baseConfig from "../../packages/config/src/base.vite";

export default mergeConfig(baseConfig, {
  server: {
    port: 8002,
    proxy: {
      "/api": {
        target: "http://localhost:8001",
        changeOrigin: true,
      },
    },
  },
  resolve: {},
  plugins: [],
});
