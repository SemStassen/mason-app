import { Effect, Layer } from "effect";

import { Database } from "#shared/database/index";

export const DatabaseLayer = Layer.effect(
  Database,
  Effect.gen(function* () {
    return {
      withTransaction:  
    }
  })
);
