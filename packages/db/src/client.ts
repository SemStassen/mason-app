import { PgClient } from '@effect/sql-pg';
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Config, Context, Effect, Layer, Redacted, Schema } from "effect";
import { relations } from "./relations";
// biome-ignore lint/performance/noNamespaceImport: Needed for schema
import * as schema from "./schema";
import { types } from 'pg';

export type { SqlError } from "@effect/sql/SqlError";

const PgClientLive = PgClient.layer({
  password: Redacted.make(process.env.POSTGRES_PW!),
  username: process.env.POSTGRES_USER!,
  database: process.env.POSTGRES_DATABASE!,
  host: process.env.POSTGRES_HOST!,
  port: parseInt(process.env.POSTGRES_PORT!),
  types: {
    getTypeParser: (typeId, format) => {
      // Return raw values for date/time types to let Drizzle handle parsing
      if ([1184, 1114, 1082, 1186, 1231, 1115, 1185, 1187, 1182].includes(typeId)) {
        return (val: any) => val;
      }
      return types.getTypeParser(typeId, format);
    },
  },
});

export class DrizzleService extends Context.Tag("@mason/db/DrizzleService")<
  DrizzleService,
  PgDrizzle.EffectPgDatabase<typeof schema, typeof relations>
>() {
  static readonly live = Layer.effect(
    DrizzleService,
    Effect.gen(function* () {
      const db = yield* PgDrizzle.make({ 
          relations: relations, 
          schema: schema
       }).pipe(
        Effect.provide(PgDrizzle.DefaultServices),
      );;

      return db;
    })
  ).pipe(Layer.provide(PgClientLive));
}


