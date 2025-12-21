import { Context, Effect, Layer, Schema } from "effect";
import { SqlSchema } from "@effect/sql";
import type { ResultLengthMismatch, SqlError } from "@effect/sql/SqlError";
import type { ParseError } from "effect/ParseResult";
import { and, eq, inArray, sql } from "@mason/db/operators";
import { projectsTable } from "@mason/db/schema";
import { DatabaseService } from "@mason/db/service";
import { ProjectId, WorkspaceId } from "@mason/framework/types/ids";
import { Project } from "../models/project.model";

export class ProjectRepository extends Context.Tag("ProjectRepository")<
  ProjectRepository,
  {
    insertProjects: (
      workspaceId: WorkspaceId,
      projects: Array<Project>
    ) => Effect.Effect<
      readonly Project[],
      ResultLengthMismatch | SqlError | ParseError
    >;
    updateProjects: (
      workspaceId: WorkspaceId,
      projects: Array<Project>
    ) => Effect.Effect<
      readonly Project[],
      ResultLengthMismatch | SqlError | ParseError
    >;
    softDeleteProjects: (
      workspaceId: WorkspaceId,
      projectIds: Array<ProjectId>
    ) => Effect.Effect<void, SqlError | ParseError>;
    hardDeleteProjects: (
      workspaceId: WorkspaceId,
      projectIds: Array<ProjectId>
    ) => Effect.Effect<void, SqlError | ParseError>;
    listProjects: (
      workspaceId: WorkspaceId,
      query: {
        ids?: Array<ProjectId>;
        _source?: "float";
        _externalIds?: Array<string>;
      }
    ) => Effect.Effect<readonly Project[], SqlError | ParseError>;
  }
>() {
  static readonly live = Layer.effect(
    ProjectRepository,
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      // --- Mutations / Commands ---
      const InsertProjects = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          projects: Schema.Array(Project),
        }),
        Result: Project,
        execute: ({ workspaceId, projects }) =>
          db.drizzle
            .insert(projectsTable)
            .values(projects.map((project) => ({ ...project, workspaceId })))
            .returning(),
      });

      const UpdateProjects = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          projects: Schema.Array(Project),
        }),
        Result: Project,
        execute: ({ workspaceId, projects }) =>
          Effect.forEach(
            projects,
            (project) =>
              db.drizzle
                .update(projectsTable)
                .set(project)
                .where(
                  and(
                    eq(projectsTable.workspaceId, workspaceId),
                    eq(projectsTable.id, project.id)
                  )
                )
                .returning(),
            { concurrency: 5 }
          ),
      });

      const SoftDeleteProjects = SqlSchema.void({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          projectIds: Schema.Array(ProjectId),
        }),
        execute: ({ workspaceId, projectIds }) =>
          db.drizzle
            .update(projectsTable)
            .set({ deletedAt: new Date() })
            .where(
              and(
                eq(projectsTable.workspaceId, workspaceId),
                inArray(projectsTable.id, projectIds)
              )
            ),
      });

      const HardDeleteProjects = SqlSchema.void({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          projectIds: Schema.Array(ProjectId),
        }),
        execute: ({ workspaceId, projectIds }) =>
          db.drizzle
            .delete(projectsTable)
            .where(
              and(
                eq(projectsTable.workspaceId, workspaceId),
                inArray(projectsTable.id, projectIds)
              )
            ),
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
          ].filter(Boolean);

          return db.drizzle.query.projectsTable.findMany({
            where: and(...whereConditions),
          });
        },
      });

      // --- Repository Methods ---
      const insertProjects = (
        workspaceId: WorkspaceId,
        projects: Array<Project>
      ) =>
        db.withWorkspace(
          workspaceId,
          InsertProjects({ workspaceId, projects })
        );

      const updateProjects = (
        workspaceId: WorkspaceId,
        projects: Array<Project>
      ) =>
        db.withWorkspace(
          workspaceId,
          UpdateProjects({ workspaceId, projects })
        );

      const softDeleteProjects = (
        workspaceId: WorkspaceId,
        projectIds: Array<ProjectId>
      ) =>
        db.withWorkspace(
          workspaceId,
          SoftDeleteProjects({ workspaceId, projectIds })
        );

      const hardDeleteProjects = (
        workspaceId: WorkspaceId,
        projectIds: Array<ProjectId>
      ) =>
        db.withWorkspace(
          workspaceId,
          HardDeleteProjects({ workspaceId, projectIds })
        );

      const listProjects = (
        workspaceId: WorkspaceId,
        query: {
          ids?: Array<ProjectId>;
          _source?: "float";
          _externalIds?: Array<string>;
        }
      ) => db.withWorkspace(workspaceId, ListProjects({ workspaceId, query }));

      return ProjectRepository.of({
        insertProjects,
        updateProjects,
        softDeleteProjects,
        hardDeleteProjects,
        listProjects,
      });
    })
  );
}
