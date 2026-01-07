import { SqlClient } from "@effect/sql";
import PgDrizzle from "@effect/sql-drizzle/Pg";
import type { PgRemoteDatabase } from "drizzle-orm/pg-proxy";
import { Context, Effect, Layer } from "effect";
import { DatabaseError } from "~/shared/errors";
// biome-ignore lint/performance/noNamespaceImport: Needed for schema
import * as schema from "./schema";

type DrizzleClient = PgRemoteDatabase<typeof schema>;

/**
 * Database service that provides:
 * - Drizzle client for type-safe queries
 * - Workspace-scoped operations with RLS via set_config
 * - Transaction support (nesting handled by @effect/sql via savepoints)
 */
export class DatabaseService extends Context.Tag("@mason/db/DatabaseService")<
  DatabaseService,
  {
    /** Drizzle client for database queries */
    readonly drizzle: DrizzleClient;

    /**
     * Run operations in a transaction without workspace context.
     * Useful for cross-workspace operations or admin tasks.
     */
    readonly withTransaction: <A, E, R>(
      effect: Effect.Effect<A, E, R>
    ) => Effect.Effect<A, E | DatabaseError, R>;
  }
>() {
  static readonly live = Layer.effect(
    DatabaseService,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const drizzle = yield* PgDrizzle.make({ schema });

      return DatabaseService.of({
        drizzle,
        withTransaction: (effect) =>
          sql
            .withTransaction(effect)
            .pipe(Effect.mapError((e) => new DatabaseError({ cause: e }))),
      });
    })
  );
}
