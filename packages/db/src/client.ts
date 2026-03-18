import { PgClient } from "@effect/sql-pg";
// biome-ignore lint/performance/noNamespaceImport: Needed for PgDrizzle
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Config, Effect, Layer, ServiceMap } from "effect";
import { types as pgTypes } from "pg";
import { relations } from "./relations";
// biome-ignore lint/performance/noNamespaceImport: Needed for schema
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

export class Drizzle extends ServiceMap.Service<Drizzle>()(
  "@mason/db/Drizzle",
  {
    make: Effect.gen(function* () {
      const db = yield* PgDrizzle.make({
        relations,
        schema,
      }).pipe(Effect.provide(PgDrizzle.DefaultServices));

      return db;
    }),
  }
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(PgClientLayer)
  );
}
