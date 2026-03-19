import { PgClient } from "@effect/sql-pg";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Config, Effect, Layer, ServiceMap } from "effect";
import { types as pgTypes } from "pg";

import { relations } from "./relations";
import * as schema from "./schema";

const PgClientLayer = PgClient.layerConfig({
  url: Config.redacted("DATABASE_URL"),
  types: Config.succeed({
    getTypeParser: (typeId, format) => {
      if (
        [1184, 1114, 1082, 1186, 1231, 1115, 1185, 1187, 1182].includes(typeId)
      ) {
        return (value: string) => value;
      }

      return pgTypes.getTypeParser(typeId, format);
    },
  }),
} satisfies Config.Wrap<PgClient.PgClientConfig>);

// Do not construct using the make syntax, seems to break types
export class Drizzle extends ServiceMap.Service<
  Drizzle,
  PgDrizzle.EffectPgDatabase<typeof schema, typeof relations>
>()("@mason/db/Drizzle") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function* () {
      const db = yield* PgDrizzle.make({
        relations,
        schema,
      }).pipe(Effect.provide(PgDrizzle.DefaultServices));

      return db;
    })
  ).pipe(Layer.provide(PgClientLayer));
}

export const makePgDrizzle = Effect.gen(function* () {
  const db = yield* PgDrizzle.make({
    relations,
    schema,
  }).pipe(
    Effect.provide(Layer.provideMerge(PgDrizzle.DefaultServices, PgClientLayer))
  );

  return db;
});
