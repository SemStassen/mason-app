import { drizzle as makeDrizzle } from "drizzle-orm/node-postgres";
import { Config, Effect, Layer } from "effect";
import { Pool } from "pg";

import { Database, DatabaseError } from "./database.service";
import type { DatabaseShape, DrizzleDb, TransactionDb } from "./database.service";
import { relations } from "./relations";
import * as schema from "./schema";

// TODO(db-v4-effect): remove this Promise compatibility check when migrating
// back to the Effect SQL v4 driver.
const isThenable = (value: unknown): value is Promise<unknown> =>
  typeof value === "object" &&
  value !== null &&
  "then" in value &&
  typeof value.then === "function";

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
      relations,
      schema,
    });

    const makeDatabase = (currentDrizzle: DrizzleDb | TransactionDb): DatabaseShape => {
      const runDrizzle = <A, E, R = never>(
        f: (drizzle: DrizzleDb | TransactionDb) => Effect.Effect<A, E, R> | Promise<A>
      ): Effect.Effect<A, E | DatabaseError, R> =>
        Effect.suspend(() => {
          const result = f(currentDrizzle);

          // Temporary shim: allow repository callsites to keep returning
          // Drizzle promises (e.g. `.execute()`) while still exposing an
          // Effect-based Database service boundary.
          //
          // TODO(db-v4-effect): delete this Promise branch and keep only the
          // pure Effect path once the Effect SQL v4 driver is in place.
          if (isThenable(result)) {
            return Effect.tryPromise({
              try: () => result,
              catch: (cause) => new DatabaseError({ cause }),
            }) as Effect.Effect<A, E | DatabaseError, R>;
          }

          return result;
        });

      const database: DatabaseShape = {
        unsafeDrizzle: drizzle,
        drizzle: runDrizzle,
        withTransaction: <A, E, R>(effect: Effect.Effect<A, E, R>) =>
          Effect.gen(function* () {
            const services = yield* Effect.services<R>();

            return yield* Effect.tryPromise({
              try: () =>
                currentDrizzle.transaction((transaction) =>
                  Effect.runPromiseWith(services)(
                    effect.pipe(
                      Effect.provideService(
                        Database,
                        makeDatabase(transaction)
                      )
                    )
                  )
                ),
              catch: (cause) => new DatabaseError({ cause }),
            });
          }) as Effect.Effect<A, E | DatabaseError, Exclude<R, Database>>,
      };

      return database;
    };

    return makeDatabase(drizzle);
  })
);

export const DatabaseLayer = DatabaseLayerBase;
