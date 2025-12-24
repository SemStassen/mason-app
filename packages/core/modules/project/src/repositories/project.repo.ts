import { SqlSchema } from "@effect/sql";
import { and, eq, inArray, isNotNull, sql } from "@mason/db/operators";
import { type DbProject, projectsTable } from "@mason/db/schema";
import { DatabaseService } from "@mason/db/service";
import type { RepositoryError } from "@mason/framework/errors/database";
import { ProjectId, WorkspaceId } from "@mason/framework/types";
import { Context, Effect, Layer, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import { Project } from "../models/project.model";

const _mapToDb = (
  project: typeof Project.Encoded
): Omit<DbProject, "createdAt" | "updatedAt" | "deletedAt"> => {
  return {
    id: project.id,
    workspaceId: project.workspaceId,
    name: project.name,
    hexColor: project.hexColor,
    startDate: project.startDate,
    endDate: project.endDate,
    isBillable: project.isBillable,
    notes: project.notes,
    _metadata: project._metadata,
  };
};

export class ProjectRepository extends Context.Tag(
  "@mason/project/ProjectRepository"
)<
  ProjectRepository,
  {
    insert: (
      projects: NonEmptyReadonlyArray<Project>
    ) => Effect.Effect<ReadonlyArray<Project>, RepositoryError>;
    update: (
      projects: NonEmptyReadonlyArray<Project>
    ) => Effect.Effect<ReadonlyArray<Project>, RepositoryError>;
    hardDelete: (
      projectIds: NonEmptyReadonlyArray<ProjectId>
    ) => Effect.Effect<void, RepositoryError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: ReadonlyArray<ProjectId>;
        _source?: "float";
        _externalIds?: ReadonlyArray<string>;
        _includeDeleted?: boolean;
      };
    }) => Effect.Effect<ReadonlyArray<Project>, RepositoryError>;
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
        Request: Schema.NonEmptyArray(ProjectId),
        execute: (projectIds) =>
          db.drizzle
            .delete(projectsTable)
            .where(inArray(projectsTable.id, projectIds)),
      });

      // --- Queries ---
      const ListProjects = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
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

      return ProjectRepository.of({
        insert: Effect.fn("@mason/project/ProjectRepo.insert")((projects) =>
          InsertProjects(projects)
        ),

        update: Effect.fn("@mason/project/ProjectRepo.update")((projects) =>
          UpdateProjects(projects)
        ),

        hardDelete: Effect.fn("@mason/project/ProjectRepo.hardDelete")(
          (projectIds) => HardDeleteProjects(projectIds)
        ),

        list: Effect.fn("@mason/project/ProjectRepo.list")((params) =>
          ListProjects(params)
        ),
      });
    })
  );
}
