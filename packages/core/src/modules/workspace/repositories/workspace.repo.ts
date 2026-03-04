import { SqlSchema } from "@effect/sql";
import { DrizzleService, schema } from "@mason/db";
import { and, eq, inArray, type SQL } from "drizzle-orm";
import { Context, Effect, Layer, Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import { wrapSqlError } from "~/infra/db";
import type { WorkspaceId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import { Workspace } from "../domain/workspace.entity";
import { createSelectSchema } from "drizzle-orm/effect-schema";

const WorkspaceSelect = createSelectSchema(schema.workspacesTable);
type WorkspaceSelect = typeof WorkspaceSelect.Type;

const rowToWorkspace = (row: WorkspaceSelect): Workspace =>
  Schema.decodeUnknownSync(Workspace)({
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: Option.fromNullable(row.logoUrl),
    metadata: Option.fromNullable(row.metadata),
  });

const workspaceToDb = (workspace: typeof Workspace.entity.Encoded) => ({
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
    retrieveBySlug: (params: {
        slug: Workspace["slug"]
    }) => Effect.Effect<Option.Option<Workspace>, DatabaseError>;
    retrieveById: (params: {
      id: WorkspaceId;
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
          workspaces: Schema.Array(Workspace.entity),
        }),
        Result: WorkspaceSelect,
        execute: (request) =>
          drizzle
            .insert(schema.workspacesTable)
            .values(request.workspaces.map(workspaceToDb))
            .returning(),
      });

      const updateQuery = SqlSchema.findAll({
        Request: Schema.Struct({ workspace: Workspace.entity }),
        Result: WorkspaceSelect,
        execute: (request) =>
          drizzle
            .update(schema.workspacesTable)
            .set(workspaceToDb(request.workspace))
            .where(eq(schema.workspacesTable.id, request.workspace.id))
            .returning(),
      });

      const retrieveBySlugQuery = SqlSchema.findOne({
        Request: Schema.Struct({
          slug: Schema.String,
        }),
        Result: WorkspaceSelect,
        execute: (request) =>
          drizzle
            .select()
            .from(schema.workspacesTable)
            .where(eq(schema.workspacesTable.slug, request.slug))
            .limit(1),
      });

      const retrieveByIdQuery = SqlSchema.findOne({
        Request: Schema.Struct({
          id: Schema.String,
        }),
        Result: WorkspaceSelect,
        execute: (request) =>  drizzle
          .select()
          .from(schema.workspacesTable)
          .where(eq(schema.workspacesTable.id, request.id))
          .limit(1),
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
          return yield* insertQuery({ workspaces }).pipe(
            Effect.map((rows) => rows.map(rowToWorkspace))
          );
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

        retrieveBySlug: Effect.fn("@mason/workspace/WorkspaceRepo.retrieveBySlug")(function* ({ slug }) {
          const maybeRow = yield* retrieveBySlugQuery({ slug });

          return Option.map(maybeRow, rowToWorkspace);
        }, wrapSqlError),

        retrieveById: Effect.fn("@mason/workspace/WorkspaceRepo.retrieveById")(
          function* ({ id }) {
            const maybeRow = yield* retrieveByIdQuery({ id });

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
