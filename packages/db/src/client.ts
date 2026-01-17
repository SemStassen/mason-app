import PgDrizzle from "@effect/sql-drizzle/Pg";
import PgClient from "@effect/sql-pg/PgClient";
import type { PgRemoteDatabase } from "drizzle-orm/pg-proxy/driver";
import { Config, Context, Effect, Layer } from "effect";
import { schema } from ".";

/**
 * PostgreSQL client layer configured from DATABASE_URL environment variable.
 */
const PgLive = PgClient.layerConfig({
  password: Config.redacted("POSTGRES_PW"),
  username: Config.succeed("postgres"),
  database: Config.succeed("postgres"),
  host: Config.succeed("localhost"),
  port: Config.succeed(5435),
});

/**
 * Drizzle service tag that provides a Drizzle client instance with the schema.
 * Requires PgLive to be provided in the layer hierarchy.
 *
 * Usage:
 * ```ts
 * const drizzle = yield* DrizzleService;
 * ```
 */
export class DrizzleService extends Context.Tag("@mason/db/DrizzleService")<
  DrizzleService,
  {
    readonly drizzle: PgRemoteDatabase<typeof schema>;
  }
>() {
  static readonly live = Layer.effect(
    DrizzleService,
    Effect.gen(function* () {
      const drizzle = yield* PgDrizzle.make({ schema });

      return DrizzleService.of({
        drizzle: drizzle as unknown as PgRemoteDatabase<typeof schema>,
      });
    })
  ).pipe(Layer.provide(PgLive));
}
