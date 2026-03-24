import { createEnv } from "@t3-oss/env-core";
import { Schema } from "effect";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_BACKEND_URL: Schema.String.pipe(Schema.toStandardSchemaV1),
  },
  runtimeEnv: import.meta.env,
});
