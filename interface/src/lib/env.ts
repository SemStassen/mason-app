import { createEnv } from "@t3-oss/env-core";
import { Schema } from "effect";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_DEV: Schema.Boolean.pipe(Schema.toStandardSchemaV1),
    VITE_BACKEND_URL: Schema.String.pipe(Schema.toStandardSchemaV1),
    VITE_ELECTRIC_PROXY_URL: Schema.String.pipe(Schema.toStandardSchemaV1),
  },
  runtimeEnv: {
    ...import.meta.env,
    VITE_DEV: import.meta.env.DEV,
  },
});
