import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Schema, ServiceMap } from "effect";
import type { Effect } from "effect";

import type { relations } from "./relations";
import type * as schema from "./schema";

export class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()(
  "infra/DatabaseError",
  {
    cause: Schema.Unknown,
  }
) {}

export type DrizzleDb = NodePgDatabase<typeof schema, typeof relations>;

export type TransactionDb = Parameters<
  Parameters<DrizzleDb["transaction"]>[0]
>[0];

export interface DatabaseShape {
  /**
   * Integration-only escape hatch to plain Drizzle.
   */
  readonly unsafeDrizzle: DrizzleDb;
  /**
   * Preferred query entrypoint for application code.
   *
   * TEMPORARY COMPATIBILITY:
   * This callback currently accepts either an Effect or a Promise result while
   * we are on plain Drizzle + pg. Keep Promise handling centralized in the DB
   * layer only.
   *
   * TODO(db-v4-effect): When switching back to the Effect SQL v4 driver,
   * remove `Promise<A>` from this signature so `drizzle` is Effect-only.
   */
  readonly drizzle: <A, E, R = never>(
    f: (drizzle: DrizzleDb | TransactionDb) => Effect.Effect<A, E, R> | Promise<A>
  ) => Effect.Effect<A, E | DatabaseError, R>;
  /**
   * Run operations in a transaction.
   *
   * **Error Handling:**
   * - If the effect fails with any error, the transaction is rolled back
   * - To handle errors and continue, catch them within the transaction
   * - To explicitly rollback, let an error propagate (or fail with DatabaseError)
   *
   * **Nested Transactions (Checkpoints):**
   * Nested transactions are automatically handled via savepoints.
   * You can create checkpoints by nesting `withTransaction` calls:
   *
   * @example
   * ```ts
   * // Handle errors without rolling back
   * yield* db.withTransaction(
   *   Effect.gen(function* () {
   *     yield* doSomething();
   *
   *     // Catch and handle errors, transaction continues
   *     yield* doMore().pipe(
   *       Effect.catchAll((error) => {
   *         // Handle error, transaction still commits
   *         return Effect.succeed(defaultValue);
   *       })
   *     );
   *   })
   * );
   *
   * // Create checkpoint with nested transaction
   * yield* db.withTransaction(
   *   Effect.gen(function* () {
   *     yield* doSomething();
   *
   *     // Nested transaction = checkpoint
   *     yield* db.withTransaction(
   *       Effect.gen(function* () {
   *         yield* doMore();
   *         // If this fails, rolls back to checkpoint only
   *       })
   *     );
   *   })
   * );
   * ```
   */
  readonly withTransaction: <A, E, R>(
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E | DatabaseError, Exclude<R, Database>>;
}

export class Database extends ServiceMap.Service<Database, DatabaseShape>()(
  "@mason/db/Database"
) {}
