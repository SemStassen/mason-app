import { drizzle as makeDrizzle } from "drizzle-orm/node-postgres";
import { Config, Effect, Layer, ServiceMap } from "effect";
import { Pool } from "pg";

import { Database, DatabaseError } from "./database.service";
import type {
  ActiveConnection,
  DatabaseShape,
  DrizzleCallbackResult,
  DrizzleDb,
} from "./database.service";
import * as schema from "./schema";

// TODO(db-v4-effect): remove this Promise compatibility check when migrating
// back to the Effect SQL v4 driver.
const isThenable = (value: unknown): value is Promise<unknown> =>
  typeof value === "object" &&
  value !== null &&
  "then" in value &&
  typeof value.then === "function";

const normalizeDriverResult = <A, E, R = never>(
  result: DrizzleCallbackResult<A, E, R>
): Effect.Effect<A, E | DatabaseError, R> => {
  if (isThenable(result)) {
    return Effect.tryPromise({
      try: () => result,
      catch: (cause) => new DatabaseError({ cause }),
    }) as Effect.Effect<A, E | DatabaseError, R>;
  }

  return result;
};

const DatabaseLayerBase = Layer.effect(
  Database,
  Effect.gen(function* () {
    const databaseUrl = yield* Config.string("DATABASE_URL");

    const pool = yield* Effect.acquireRelease(
      Effect.sync(() => new Pool({ connectionString: databaseUrl })),
      (pgPool) => Effect.promise(() => pgPool.end()).pipe(Effect.orDie)
    );

    const drizzle: DrizzleDb = makeDrizzle({
      client: pool,
      schema,
    });

    const ActiveConnection = ServiceMap.Reference<ActiveConnection>(
      "@recount/db/ActiveConnection",
      {
        defaultValue: () => drizzle,
      }
    );

    const database: DatabaseShape = {
      unsafeDrizzle: drizzle,
      drizzle: <A, E, R = never>(
        f: (drizzle: ActiveConnection) => DrizzleCallbackResult<A, E, R>
      ): Effect.Effect<A, E | DatabaseError, R> =>
        Effect.gen(function* () {
          const activeConnection = yield* ActiveConnection;

          // Temporary shim: allow repository callsites to keep returning
          // Drizzle promises (e.g. `.execute()`) while still exposing an
          // Effect-based Database service boundary.
          //
          // TODO(db-v4-effect): delete Promise support and keep only the pure
          // Effect path once the Effect SQL v4 driver is in place.
          return yield* normalizeDriverResult(f(activeConnection));
        }),
      withTransaction: <A, E, R>(effect: Effect.Effect<A, E, R>) =>
        Effect.gen(function* () {
          const services = yield* Effect.services<R>();
          const activeConnection = yield* ActiveConnection;

          return yield* Effect.tryPromise({
            try: () =>
              activeConnection.transaction((transaction) =>
                Effect.runPromiseWith(services)(
                  Effect.provideService(effect, ActiveConnection, transaction)
                )
              ),
            catch: (cause) => new DatabaseError({ cause }),
          });
        }) as Effect.Effect<A, E | DatabaseError, Exclude<R, Database>>,
    };

    return database;
  })
);

export const DatabaseLayer = DatabaseLayerBase;
