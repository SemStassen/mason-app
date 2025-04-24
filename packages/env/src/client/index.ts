import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { sharedEnv } from "..";

export const clientEnv = createEnv({
  server: {},
  client: {
    VITE_ELECTRIC_URL: z.string().optional(),
  },
  clientPrefix: "VITE_",
  runtimeEnv: import.meta.env,
  extends: [sharedEnv],
});
