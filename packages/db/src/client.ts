import { PgClient } from "@effect/sql-pg";
// biome-ignore lint/performance/noNamespaceImport: Needed for PgDrizzle
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Effect, Layer, Redacted, ServiceMap } from "effect";
import { types } from "pg";
import { relations } from "./relations";
// biome-ignore lint/performance/noNamespaceImport: Needed for schema
import * as schema from "./schema";

const PgClientLive = PgClient.layer({
  password: Redacted.make(process.env.POSTGRES_PW!),
  username: process.env.POSTGRES_USER!,
  database: process.env.POSTGRES_DATABASE!,
  host: process.env.POSTGRES_HOST!,
  port: Number.parseInt(process.env.POSTGRES_PORT!),
  types: {
    getTypeParser: (typeId, format) => {
      // Return raw values for date/time types to let Drizzle handle parsing
      if (
        [1184, 1114, 1082, 1186, 1231, 1115, 1185, 1187, 1182].includes(typeId)
      ) {
        return (val: any) => val;
      }
      return types.getTypeParser(typeId, format);
    },
  },
});

export class Drizzle extends ServiceMap.Service<
  Drizzle,
  PgDrizzle.EffectPgDatabase<typeof schema, typeof relations>
>()("@mason/db/Drizzle") {
  static readonly layer = Layer.effect(
    Drizzle,
    Effect.gen(function* () {
      const db = yield* PgDrizzle.make({
        relations: relations,
        schema: schema,
      }).pipe(Effect.provide(PgDrizzle.DefaultServices));

      return db;
    })
  ).pipe(Layer.provide(PgClientLive));
}
