import { Context, type Effect, Schema } from "effect";

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
  "infra/DatabaseError",
  {
    cause: Schema.Unknown,
  }
) {}

export class DatabaseService extends Context.Tag("@mason/db/DatabaseService")<
  DatabaseService,
  {
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
    ) => Effect.Effect<A, E | DatabaseError, R>;
  }
>() {}
