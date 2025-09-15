import { drizzle, Pool } from "@mason/db/db";
// biome-ignore lint/performance/noNamespaceImport: We have to here
import * as schema from "@mason/db/schema";
import { Config, Data, Effect, FiberRef } from "effect";

type Drizzle = ReturnType<typeof drizzle<typeof schema>>;
type Transaction = Parameters<Parameters<Drizzle["transaction"]>[0]>[0];

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly cause: unknown;
}> {}

export class DatabaseService extends Effect.Service<DatabaseService>()(
  "@mason/DatabaseService",
  {
    scoped: Effect.gen(function* () {
      const DbConfig = Config.all({
        host: Config.string("DB_HOST").pipe(Config.withDefault("localhost")),
        port: Config.number("DB_PORT").pipe(Config.withDefault(5442)),
        user: Config.string("DB_USER").pipe(Config.withDefault("postgres")),
        password: Config.string("DB_PASSWORD"),
        database: Config.string("DB_NAME").pipe(Config.withDefault("multa")),
      });

      const dbConfig = yield* DbConfig;

      const pool = yield* Effect.acquireRelease(
        Effect.sync(
          () =>
            new Pool({
              host: dbConfig.host,
              port: dbConfig.port,
              user: dbConfig.user,
              password: dbConfig.password,
              database: dbConfig.database,
              ssl: false,
            })
        ),
        (pgPool) => Effect.promise(() => pgPool.end())
      );

      const db = drizzle({ schema: schema, client: pool });

      const currentTransaction = yield* FiberRef.make<Transaction | null>(null);

      yield* Effect.logInfo("✅ Database connected successfully");

      return {
        _drizzle: db,
        getCurrentConnection: () =>
          Effect.gen(function* () {
            const tx = yield* FiberRef.get(currentTransaction);
            return tx || db;
          }),

        withTransaction: <A, E, R>(operation: Effect.Effect<A, E, R>) =>
          Effect.gen(function* () {
            const context = yield* Effect.context<R>();

            return yield* Effect.tryPromise({
              try: () =>
                db.transaction(async (tx) =>
                  Effect.runPromise(
                    Effect.locally(
                      currentTransaction,
                      tx
                    )(operation.pipe(Effect.provide(context)))
                  )
                ),
              catch: (cause) => new DatabaseError({ cause }),
            });
          }),
        use: <A>(fn: (conn: Drizzle | Transaction) => Promise<A>) =>
          Effect.gen(function* () {
            const tx = yield* FiberRef.get(currentTransaction);
            const conn = tx || db;
            return yield* Effect.tryPromise({
              try: () => fn(conn),
              catch: (cause) => new DatabaseError({ cause }),
            });
          }),
      };
    }),
  }
) {}
