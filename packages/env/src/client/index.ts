import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { sharedEnv } from "..";

export const clientEnv = createEnv({
  server: {
    MODE: z.enum(["development", "production"]),
  },
  client: {
    VITE_ELECTRIC_URL: z.string(),
    VITE_MASON_API_URL: z.string(),
  },
  clientPrefix: "VITE_",
  runtimeEnv: import.meta.env,
  extends: [sharedEnv],
  /**
   * This is a workaround for the fact that we can't access VITE's base ENV's on the client otherwise
   */
  isServer: true,
});
