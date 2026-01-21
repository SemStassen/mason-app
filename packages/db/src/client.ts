import { SqlError } from "@effect/sql/SqlError";
import PgDrizzle from "@effect/sql-drizzle/Pg";
import PgClient from "@effect/sql-pg/PgClient";
import { Config, Context, Effect, Layer } from "effect";
// biome-ignore lint/performance/noNamespaceImport: Needed for schema
import * as schema from "./schema";

export type { SqlError } from "@effect/sql/SqlError";

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
 * Drizzle database type - inferred from what PgDrizzle.make returns.
 */
type DrizzleDb = Effect.Effect.Success<
  ReturnType<typeof PgDrizzle.make<typeof schema>>
>;

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
  {
    /**
     * Execute a Drizzle query wrapped in Effect.tryPromise.
     */
    readonly use: <T>(
      fn: (db: DrizzleDb) => PromiseLike<T>
    ) => Effect.Effect<T, SqlError>;
  }
>() {
  static readonly live = Layer.effect(
    DrizzleService,
    Effect.gen(function* () {
      const db = yield* PgDrizzle.make({ schema });

      return {
        use: <T>(fn: (db: DrizzleDb) => PromiseLike<T>) =>
          Effect.tryPromise({
            try: () => fn(db),
            catch: (cause) =>
              new SqlError({ cause, message: "Drizzle query failed" }),
          }),
      };
    })
  ).pipe(Layer.provide(PgLive));
}
