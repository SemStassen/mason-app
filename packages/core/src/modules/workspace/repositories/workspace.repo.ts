import { SqlSchema } from "@effect/sql";
import { DrizzleService, schema } from "@mason/db";
import { and, eq, inArray, type SQL } from "drizzle-orm";
import { Context, Effect, Layer, Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import { wrapSqlError } from "~/infra/db";
import type { WorkspaceId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import { Workspace } from "../domain/workspace.model";

/**
 * Schema representing a database row from the workspaces table.
 * Includes all fields including metadata (createdAt, updatedAt).
 */
const WorkspaceDbRow = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  slug: Schema.String,
  logoUrl: Schema.NullOr(Schema.String),
  metadata: Schema.NullOr(Schema.String),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
});
type WorkspaceDbRow = typeof WorkspaceDbRow.Type;

/**
 * Convert database row to Workspace domain entity.
 * Pure function - no Effect wrapping needed.
 */
const rowToWorkspace = (row: WorkspaceDbRow): Workspace =>
  Schema.decodeUnknownSync(Workspace)({
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: Option.fromNullable(row.logoUrl),
    metadata: Option.fromNullable(row.metadata),
  });

/**
 * Maps domain model to database format (Option<string> -> string | null).
 */
const workspaceToDb = (workspace: typeof Workspace.Encoded) => ({
  id: workspace.id,
  name: workspace.name,
  slug: workspace.slug,
  logoUrl: Option.getOrNull(workspace.logoUrl),
  metadata: Option.getOrNull(workspace.metadata),
});

export class WorkspaceRepository extends Context.Tag(
  "@mason/workspace/WorkspaceRepository"
)<
  WorkspaceRepository,
  {
    insert: (params: {
      workspaces: NonEmptyReadonlyArray<Workspace>;
    }) => Effect.Effect<ReadonlyArray<Workspace>, DatabaseError>;
    update: (params: {
      workspaces: NonEmptyReadonlyArray<Workspace>;
    }) => Effect.Effect<ReadonlyArray<Workspace>, DatabaseError>;
    retrieve: (params: {
      query: AtLeastOne<{
        id?: WorkspaceId;
        slug?: string;
      }>;
    }) => Effect.Effect<Option.Option<Workspace>, DatabaseError>;
    hardDelete: (params: {
      workspaceIds: NonEmptyReadonlyArray<WorkspaceId>;
    }) => Effect.Effect<void, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    WorkspaceRepository,
    Effect.gen(function* () {
      const drizzle = yield* DrizzleService;

      const insertQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaces: Schema.Array(Workspace.model),
        }),
        Result: WorkspaceDbRow,
        execute: (request) =>
          drizzle
            .insert(schema.workspacesTable)
            .values(request.workspaces.map(workspaceToDb))
            .returning(),
      });

      const updateQuery = SqlSchema.findAll({
        Request: Schema.Struct({ workspace: Workspace.model }),
        Result: WorkspaceDbRow,
        execute: (request) =>
          drizzle
            .update(schema.workspacesTable)
            .set(workspaceToDb(request.workspace))
            .where(eq(schema.workspacesTable.id, request.workspace.id))
            .returning(),
      });

      const retrieveQuery = SqlSchema.findOne({
        Request: Schema.Struct({
          id: Schema.optional(Schema.String),
          slug: Schema.optional(Schema.String),
        }),
        Result: WorkspaceDbRow,
        execute: (request) => {
          const whereConditions: Array<SQL> = [];

          if (request.id) {
            whereConditions.push(eq(schema.workspacesTable.id, request.id));
          }

          if (request.slug) {
            whereConditions.push(eq(schema.workspacesTable.slug, request.slug));
          }

          return drizzle
            .select()
            .from(schema.workspacesTable)
            .where(
              whereConditions.length > 0 ? and(...whereConditions) : undefined
            )
            .limit(1);
        },
      });

      const hardDeleteQuery = SqlSchema.void({
        Request: Schema.Struct({
          workspaceIds: Schema.Array(Schema.String),
        }),
        execute: (request) =>
          drizzle
            .delete(schema.workspacesTable)
            .where(inArray(schema.workspacesTable.id, request.workspaceIds)),
      });

      return WorkspaceRepository.of({
        insert: Effect.fn("@mason/workspace/WorkspaceRepo.insert")(function* ({
          workspaces,
        }) {
          const rows = yield* insertQuery({ workspaces });

          return rows.map(rowToWorkspace);
        }, wrapSqlError),

        update: Effect.fn("@mason/workspace/WorkspaceRepo.update")(function* ({
          workspaces,
        }) {
          const results = yield* Effect.forEach(
            workspaces,
            (workspace) => updateQuery({ workspace }),
            { concurrency: 5 }
          );

          return results.flat().map(rowToWorkspace);
        }, wrapSqlError),

        retrieve: Effect.fn("@mason/workspace/WorkspaceRepo.retrieve")(
          function* ({ query }) {
            const maybeRow = yield* retrieveQuery({ ...query });

            return Option.map(maybeRow, rowToWorkspace);
          },
          wrapSqlError
        ),

        hardDelete: Effect.fn("@mason/workspace/WorkspaceRepo.hardDelete")(
          function* ({ workspaceIds }) {
            return yield* hardDeleteQuery({ workspaceIds: workspaceIds });
          },
          wrapSqlError
        ),
      });
    })
  );
}
