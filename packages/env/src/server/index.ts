import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { sharedEnv } from "..";

export const serverEnv = createEnv({
  server: {
    DB_PASSWORD: z.string(),
    BETTER_AUTH_SECRET: z.string(),

    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
  },
  client: {},
  clientPrefix: "VITE_",
  runtimeEnv: import.meta.env,
  extends: [sharedEnv],
});
