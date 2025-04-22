import { createEnv } from "@t3-oss/env-core";

export const sharedEnv = createEnv({
  server: {},
  client: {},
  clientPrefix: "VITE_",
  runtimeEnv: import.meta.env,
});
