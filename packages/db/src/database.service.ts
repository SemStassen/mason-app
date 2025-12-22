import { SqlClient, type SqlError } from "@effect/sql";
import PgDrizzle from "@effect/sql-drizzle/Pg";
import type { WorkspaceId } from "@mason/framework/types";
import type { PgRemoteDatabase } from "drizzle-orm/pg-proxy";
import { Context, Effect, Layer } from "effect";
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
     * Run operations in a transaction with workspace RLS context.
     * Nesting is handled automatically via savepoints.
     */
    readonly withWorkspace: <A, E, R>(
      workspaceId: WorkspaceId,
      effect: Effect.Effect<A, E, R>
    ) => Effect.Effect<A, E | SqlError.SqlError, R>;

    /**
     * Run operations in a transaction without workspace context.
     * Useful for cross-workspace operations or admin tasks.
     */
    readonly withTransaction: <A, E, R>(
      effect: Effect.Effect<A, E, R>
    ) => Effect.Effect<A, E | SqlError.SqlError, R>;
  }
>() {
  static readonly live = Layer.effect(
    DatabaseService,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const drizzle = yield* PgDrizzle.make({ schema });

      const withWorkspace = <A, E, R>(
        workspaceId: WorkspaceId,
        effect: Effect.Effect<A, E, R>
      ): Effect.Effect<A, E | SqlError.SqlError, R> =>
        sql.withTransaction(
          sql`SELECT set_config('app.current_workspace_id', ${workspaceId}, true)`.pipe(
            Effect.flatMap(() => effect)
          )
        );

      return DatabaseService.of({
        drizzle,
        withWorkspace,
        withTransaction: sql.withTransaction,
      });
    })
  );
}
