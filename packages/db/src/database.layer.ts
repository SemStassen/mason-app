import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Effect, Layer, Option, ServiceMap } from "effect";

import { Database, DatabaseError } from "./database.service";
import type {
  DatabaseShape,
  DrizzleDb,
  TransactionDb,
} from "./database.service";
import { relations } from "./relations";
import * as schema from "./schema";

// Internal transaction context used to scope nested transaction access.
class TransactionContext extends ServiceMap.Service<
  TransactionContext,
  TransactionDb
>()("@mason/db/TransactionContext") {}

export const DatabaseLayer = Layer.effect(
  Database,
  Effect.gen(function* () {
    const drizzle: DrizzleDb = yield* PgDrizzle.make({
      relations,
      schema,
    }).pipe(Effect.provide(PgDrizzle.DefaultServices));

    const getDrizzle = Effect.serviceOption(TransactionContext).pipe(
      Effect.flatMap(
        Option.match({
          onNone: () => Effect.succeed(drizzle),
          onSome: (transaction) => Effect.succeed(transaction),
        })
      )
    );

    const database: DatabaseShape = {
      unsafeDrizzle: drizzle,
      drizzle: (f) => Effect.flatMap(getDrizzle, f),
      withTransaction: (effect) =>
        Effect.flatMap(getDrizzle, (source) =>
          source.transaction((transaction) =>
            effect.pipe(
              Effect.provideService(Database, database),
              Effect.provideService(TransactionContext, transaction)
            )
          )
        ).pipe(
          Effect.catchTag("SqlError", (e) =>
            Effect.fail(new DatabaseError({ cause: e }))
          )
        ),
    };

    return database;
  })
);
