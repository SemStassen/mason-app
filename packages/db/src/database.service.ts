import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Schema, ServiceMap } from "effect";
import type { Effect } from "effect";

import type * as schema from "./schema";

export class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()(
  "infra/DatabaseError",
  {
    cause: Schema.Unknown,
  }
) {}

export type DrizzleDb = NodePgDatabase<typeof schema>;

export type TransactionDb = Parameters<
  Parameters<DrizzleDb["transaction"]>[0]
>[0];

export type ActiveConnection = DrizzleDb | TransactionDb;

export type DrizzleCallbackResult<A, E, R = never> =
  | Effect.Effect<A, E, R>
  | Promise<A>;

export interface DatabaseShape {
  /**
   * Integration-only escape hatch to the root Drizzle client.
   *
   * This bypasses fiber-local transaction context. Prefer `drizzle(...)` for
   * application code that should participate in `withTransaction(...)`.
   * Use this only for integrations that must talk directly to the root driver,
   * such as Better Auth.
   */
  readonly unsafeDrizzle: DrizzleDb;
  /**
   * Preferred query entrypoint for application code.
   *
   * Resolves the active Drizzle connection for the current fiber, using either
   * the root client or the innermost active transaction.
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
    f: (drizzle: ActiveConnection) => DrizzleCallbackResult<A, E, R>
  ) => Effect.Effect<A, E | DatabaseError, R>;
  /**
   * Run operations in a transaction.
   *
   * This swaps the active connection for the current fiber. Repositories may
   * safely capture `Database` once and still participate in nested
   * `withTransaction(...)` calls through `drizzle(...)`.
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
  "@recount/db/Database"
) {}
