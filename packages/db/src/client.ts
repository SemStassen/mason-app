import { layerConfig, PgClient } from "@effect/sql-pg/PgClient";
import { drizzle } from "drizzle-orm/effect-postgres";
import { Config, Context, Effect, Layer } from "effect";
import { relations } from "./relations";
// biome-ignore lint/performance/noNamespaceImport: Needed for schema
import * as schema from "./schema";

export type { SqlError } from "@effect/sql/SqlError";

/**
 * PostgreSQL client layer configured from DATABASE_URL environment variable.
 */
const PgLive = layerConfig({
  password: Config.redacted("POSTGRES_PW"),
  username: Config.succeed("postgres"),
  database: Config.succeed("postgres"),
  host: Config.succeed("localhost"),
  port: Config.succeed(5435),
});

/**
 * Drizzle database type - inferred from what drizzle() returns.
 */
type DrizzleDb = ReturnType<typeof drizzle<typeof schema, typeof relations>>;

/**
 * Drizzle service that provides a fluent API for running queries.
 *
 * Usage:
 * ```ts
 * const drizzle = yield* DrizzleService;
 * const users = yield* drizzle.use(d => d.select().from(schema.usersTable));
 * ```
 */
export class DrizzleService extends Context.Tag("@mason/db/DrizzleService")<
  DrizzleService,
  DrizzleDb
>() {
  static readonly live = Layer.effect(
    DrizzleService,
    Effect.gen(function* () {
      const pgClient = yield* PgClient;
      const drizzleDb = drizzle(pgClient, { schema, relations });

      return drizzleDb;
    })
  ).pipe(Layer.provide(PgLive));
}
