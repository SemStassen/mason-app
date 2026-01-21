import { SqlSchema } from "@effect/sql";
import { DrizzleService, schema } from "@mason/db";
import { and, eq, inArray, isNull, type SQL } from "drizzle-orm";
import { Context, DateTime, Effect, Layer, Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import { wrapSqlError } from "~/infra/db";
import { type ProjectId, WorkspaceId } from "~/shared/schemas";
import { Project } from "../domain/project.model";

/**
 * Schema representing a database row from the projects table.
 * Includes all fields including metadata (createdAt, updatedAt, archivedAt).
 */
const ProjectDbRow = Schema.Struct({
  id: Schema.String,
  workspaceId: Schema.String,
  name: Schema.String,
  hexColor: Schema.String,
  isBillable: Schema.Boolean,
  startDate: Schema.NullOr(Schema.Date),
  endDate: Schema.NullOr(Schema.Date),
  notes: Schema.NullOr(
    Schema.Record({ key: Schema.String, value: Schema.Unknown })
  ),
  archivedAt: Schema.NullOr(Schema.Date),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
});
type ProjectDbRow = typeof ProjectDbRow.Type;

/**
 * Convert database row to Project domain entity.
 * Pure function - no Effect wrapping needed.
 */
const rowToProject = (row: ProjectDbRow): Project =>
  Schema.decodeUnknownSync(Project)({
    id: row.id,
    workspaceId: row.workspaceId,
    name: row.name,
    hexColor: row.hexColor,
    isBillable: row.isBillable,
    startDate: Option.fromNullable(row.startDate),
    endDate: Option.fromNullable(row.endDate),
    notes: Option.fromNullable(row.notes),
    archivedAt: Option.fromNullable(row.archivedAt),
  });

/**
 * Maps domain model to database format (Option<T> -> T | null).
 */
const projectToDb = (project: typeof Project.Encoded) => ({
  id: project.id,
  workspaceId: project.workspaceId,
  name: project.name,
  hexColor: project.hexColor,
  isBillable: project.isBillable,
  startDate: Option.getOrNull(Option.map(project.startDate, DateTime.toDate)),
  endDate: Option.getOrNull(Option.map(project.endDate, DateTime.toDate)),
  notes: Option.getOrNull(project.notes),
  archivedAt: Option.getOrNull(Option.map(project.archivedAt, DateTime.toDate)),
});

export class ProjectRepository extends Context.Tag(
  "@mason/project/ProjectRepository"
)<
  ProjectRepository,
  {
    insert: (params: {
      projects: NonEmptyReadonlyArray<Project>;
    }) => Effect.Effect<ReadonlyArray<Project>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      projects: NonEmptyReadonlyArray<Project>;
    }) => Effect.Effect<ReadonlyArray<Project>, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query: {
        id: ProjectId;
        includeArchived?: boolean;
      };
    }) => Effect.Effect<Option.Option<Project>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<ProjectId>;
      };
    }) => Effect.Effect<ReadonlyArray<Project>, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    ProjectRepository,
    Effect.gen(function* () {
      const drizzle = yield* DrizzleService;

      const insertQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          projects: Schema.NonEmptyArray(Project.model),
        }),
        Result: ProjectDbRow,
        execute: (request) =>
          drizzle
            .insert(schema.projectsTable)
            .values(request.projects.map(projectToDb))
            .returning()
            .execute(),
      });

      const updateQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          project: Project.model,
        }),
        Result: ProjectDbRow,
        execute: (request) =>
          drizzle
            .update(schema.projectsTable)
            .set(projectToDb(request.project))
            .where(
              and(
                eq(schema.projectsTable.id, request.project.id),
                eq(schema.projectsTable.workspaceId, request.workspaceId)
              )
            )
            .returning()
            .execute(),
      });

      const retrieveQuery = SqlSchema.findOne({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          query: Schema.Struct({
            id: Schema.String,
            includeArchived: Schema.optional(Schema.Boolean),
          }),
        }),
        Result: ProjectDbRow,
        execute: (request) => {
          const whereConditions: Array<SQL> = [
            eq(schema.projectsTable.workspaceId, request.workspaceId),
            eq(schema.projectsTable.id, request.query.id),
          ];

          if (!request.query.includeArchived) {
            whereConditions.push(isNull(schema.projectsTable.archivedAt));
          }

          return drizzle
            .select()
            .from(schema.projectsTable)
            .where(and(...whereConditions))
            .limit(1)
            .execute();
        },
      });

      const listQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          ids: Schema.optional(Schema.Array(Schema.String)),
        }),
        Result: ProjectDbRow,
        execute: (request) => {
          const whereConditions: Array<SQL> = [
            eq(schema.projectsTable.workspaceId, request.workspaceId),
            isNull(schema.projectsTable.archivedAt),
          ];

          if (request.ids && request.ids.length > 0) {
            whereConditions.push(inArray(schema.projectsTable.id, request.ids));
          }

          return drizzle
            .select()
            .from(schema.projectsTable)
            .where(and(...whereConditions))
            .execute();
        },
      });

      return ProjectRepository.of({
        insert: Effect.fn("@mason/project/ProjectRepo.insert")(function* ({
          projects,
        }) {
          const rows = yield* insertQuery({ projects });

          return rows.map(rowToProject);
        }, wrapSqlError),

        update: Effect.fn("@mason/project/ProjectRepo.update")(function* ({
          workspaceId,
          projects,
        }) {
          const results = yield* Effect.forEach(
            projects,
            (project) => updateQuery({ workspaceId, project }),
            { concurrency: 5 }
          );

          return results.flat().map(rowToProject);
        }, wrapSqlError),

        retrieve: Effect.fn("@mason/project/ProjectRepo.retrieve")(function* ({
          workspaceId,
          query,
        }) {
          const maybeRow = yield* retrieveQuery({
            workspaceId,
            query: query,
          });

          return Option.map(maybeRow, rowToProject);
        }, wrapSqlError),

        list: Effect.fn("@mason/project/ProjectRepo.list")(function* ({
          workspaceId,
          query,
        }) {
          const rows = yield* listQuery({
            workspaceId,
            ids: query.ids,
          });

          return rows.map(rowToProject);
        }, wrapSqlError),
      });
    })
  );
}
