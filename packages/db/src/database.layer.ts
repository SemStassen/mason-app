import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Effect, Layer, Ref } from "effect";

import { Database } from "./database.service";
import { relations } from "./relations";
import * as schema from "./schema";

export const DatabaseLayer = Layer.effect(
  Database,
  Effect.gen(function* () {

    const drizzle = yield* PgDrizzle.make({
      relations,
      schema,
    }).pipe(Effect.provide(PgDrizzle.DefaultServices));

    const transactionRef = yield* Ref.make<{ transaction: string } | null>(null);

    return {
      drizzle: drizzle,
    }
  })
