import { drizzle, Pool } from "@mason/db/db";
import { sql } from "@mason/db/operators";
// biome-ignore lint/performance/noNamespaceImport: We have to here
import * as schema from "@mason/db/schema";
import { Config, Effect, FiberRef, Schema } from "effect";
import type { WorkspaceId } from "../models/ids";

type Drizzle = ReturnType<typeof drizzle<typeof schema>>;
type Transaction = Parameters<Parameters<Drizzle["transaction"]>[0]>[0];

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
  "@mason/mason/databaseError",
  {
    cause: Schema.Unknown,
  }
) {}

export class DatabaseConnectionError extends Schema.TaggedError<DatabaseConnectionError>()(
  "@mason/mason/databaseConnectionError",
  {
    cause: Schema.Unknown,
  }
) {}

export class DatabaseService extends Effect.Service<DatabaseService>()(
  "@mason/mason/databaseService",
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
        use: <A>(
          workspaceId: typeof WorkspaceId.Type | null,
          fn: (conn: Drizzle | Transaction) => Promise<A>
        ) =>
          Effect.gen(function* () {
            const tx = yield* FiberRef.get(currentTransaction);

            // If workspaceId is provided, set it in the transaction
            if (workspaceId) {
              if (tx) {
                // Already in a transaction → just SET LOCAL
                yield* Effect.tryPromise({
                  try: () =>
                    tx.execute(
                      sql.raw(
                        `SET LOCAL app.current_workspace_id = '${workspaceId}'`
                      )
                    ),
                  catch: (cause) => new DatabaseError({ cause }),
                });
                return yield* Effect.tryPromise({
                  try: () => fn(tx),
                  catch: (cause) => new DatabaseError({ cause }),
                });
              }

              // No transaction → create a short-lived transaction
              return yield* Effect.tryPromise({
                try: () =>
                  db.transaction(async (tx2) => {
                    await tx2.execute(
                      sql.raw(
                        `SET LOCAL app.current_workspace_id = '${workspaceId}'`
                      )
                    );
                    return fn(tx2);
                  }),
                catch: (cause) => new DatabaseError({ cause }),
              });
            }

            // workspaceId is null, so global/unscoped query
            return yield* Effect.tryPromise({
              try: () => fn(tx || db),
              catch: (cause) => new DatabaseError({ cause }),
            });
          }),
      };
    }).pipe(
      Effect.catchTags({
        ConfigError: (error) => Effect.die(error),
      })
    ),
  }
) {}
