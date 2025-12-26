import { SqlSchema } from "@effect/sql";
import { and, eq, inArray, isNotNull, sql } from "@mason/db/operators";
import { type DbProject, projectsTable } from "@mason/db/schema";
import { DatabaseService } from "@mason/db/service";
import {
  DatabaseError,
  ExistingProjectId,
  ExistingWorkspaceId,
  ProjectId,
} from "@mason/framework";
import { Context, DateTime, Effect, Layer, type Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import { Project } from "./project";

const _mapToDb = (
  project: typeof Project.Encoded
): Omit<DbProject, "createdAt" | "updatedAt"> => {
  return {
    id: project.id,
    workspaceId: project.workspaceId,
    name: project.name,
    hexColor: project.hexColor,
    startDate: project.startDate ? DateTime.toDate(project.startDate) : null,
    endDate: project.endDate ? DateTime.toDate(project.endDate) : null,
    isBillable: project.isBillable,
    notes: project.notes,
    _metadata: project._metadata,
    deletedAt: project.deletedAt ? DateTime.toDate(project.deletedAt) : null,
  };
};

export class ProjectRepository extends Context.Tag(
  "@mason/project/ProjectRepository"
)<
  ProjectRepository,
  {
    insert: (
      projects: NonEmptyReadonlyArray<Project>
    ) => Effect.Effect<ReadonlyArray<Project>, DatabaseError>;
    update: (
      projects: NonEmptyReadonlyArray<Project>
    ) => Effect.Effect<ReadonlyArray<Project>, DatabaseError>;
    hardDelete: (
      projectIds: NonEmptyReadonlyArray<ExistingProjectId>
    ) => Effect.Effect<void, DatabaseError>;
    list: (params: {
      workspaceId: ExistingWorkspaceId;
      query?: {
        ids?: ReadonlyArray<ProjectId>;
        _source?: "float";
        _externalIds?: ReadonlyArray<string>;
        _includeDeleted?: boolean;
      };
    }) => Effect.Effect<ReadonlyArray<Project>, DatabaseError>;
    retrieve: (params: {
      workspaceId: ExistingWorkspaceId;
      projectId: ProjectId;
    }) => Effect.Effect<Option.Option<Project>, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    ProjectRepository,
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      // --- Mutations / Commands ---
      const InsertProjects = SqlSchema.findAll({
        Request: Schema.NonEmptyArray(Project),
        Result: Project,
        execute: (projects) =>
          db.drizzle
            .insert(projectsTable)
            .values(projects.map(_mapToDb))
            .returning(),
      });

      const UpdateProjects = SqlSchema.findAll({
        Request: Schema.NonEmptyArray(Project),
        Result: Project,
        execute: (projects) =>
          Effect.forEach(
            projects,
            (project) =>
              db.drizzle
                .update(projectsTable)
                .set(_mapToDb(project))
                .where(eq(projectsTable.id, project.id))
                .returning(),
            { concurrency: 5 }
          ),
      });

      const HardDeleteProjects = SqlSchema.void({
        Request: Schema.NonEmptyArray(ExistingProjectId),
        execute: (projectIds) =>
          db.drizzle
            .delete(projectsTable)
            .where(inArray(projectsTable.id, projectIds)),
      });

      // --- Queries ---
      const ListProjects = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: ExistingWorkspaceId,
          query: Schema.optional(
            Schema.Struct({
              ids: Schema.optional(Schema.Array(ProjectId)),
              _source: Schema.optional(Schema.Literal("float")),
              _externalIds: Schema.optional(Schema.Array(Schema.String)),
              _includeDeleted: Schema.optional(Schema.Boolean),
            })
          ),
        }),
        Result: Project,
        execute: ({ workspaceId, query }) => {
          const whereConditions = [
            eq(projectsTable.workspaceId, workspaceId),
            query?.ids ? inArray(projectsTable.id, query.ids) : undefined,
            query?._source
              ? and(
                  sql`${projectsTable._metadata}->>'source' = ${query._source}`,
                  sql`${projectsTable._metadata}->>'externalId' IS NOT NULL`
                )
              : undefined,
            query?._externalIds?.length
              ? sql`${projectsTable._metadata}->>'externalId' IN (${sql.join(
                  query._externalIds.map((id) => sql`${id}`),
                  sql`, `
                )})`
              : undefined,
            query?._includeDeleted
              ? undefined
              : isNotNull(projectsTable.deletedAt),
          ].filter(Boolean);

          return db.drizzle.query.projectsTable.findMany({
            where: and(...whereConditions),
          });
        },
      });

      const RetrieveProject = SqlSchema.findOne({
        Request: Schema.Struct({
          workspaceId: ExistingWorkspaceId,
          projectId: ProjectId,
        }),
        Result: Project,
        execute: ({ workspaceId, projectId }) =>
          db.drizzle.query.projectsTable.findMany({
            where: and(
              eq(projectsTable.id, projectId),
              eq(projectsTable.workspaceId, workspaceId)
            ),
          }),
      });

      return ProjectRepository.of({
        insert: Effect.fn("@mason/project/ProjectRepo.insert")((projects) =>
          InsertProjects(projects).pipe(
            Effect.mapError((e) => new DatabaseError({ cause: e }))
          )
        ),

        update: Effect.fn("@mason/project/ProjectRepo.update")((projects) =>
          UpdateProjects(projects).pipe(
            Effect.mapError((e) => new DatabaseError({ cause: e }))
          )
        ),

        hardDelete: Effect.fn("@mason/project/ProjectRepo.hardDelete")(
          (projectIds) =>
            HardDeleteProjects(projectIds).pipe(
              Effect.mapError((e) => new DatabaseError({ cause: e }))
            )
        ),

        list: Effect.fn("@mason/project/ProjectRepo.list")((params) =>
          ListProjects(params).pipe(
            Effect.mapError((e) => new DatabaseError({ cause: e }))
          )
        ),

        retrieve: Effect.fn("@mason/project/ProjectRepo.retrieve")((params) =>
          RetrieveProject(params).pipe(
            Effect.mapError((e) => new DatabaseError({ cause: e }))
          )
        ),
      });
    })
  );
}
