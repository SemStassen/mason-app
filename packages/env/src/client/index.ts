import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { sharedEnv } from "..";

export const clientEnv = createEnv({
  server: {
    ELECTRIC_URL: z.string(),
  },
  client: {},
  clientPrefix: "VITE_",
  runtimeEnv: import.meta.env,
  extends: [sharedEnv],
});
