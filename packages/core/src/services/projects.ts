import { and, eq, inArray, sql } from "@mason/db/operators";
import { type DbProject, projectsTable } from "@mason/db/schema";
import { Effect, Match } from "effect";
import { ProjectId, type WorkspaceId } from "../models/ids";
import {
  Project,
  type ProjectToCreate,
  type ProjectToUpdate,
  type ProjectToUpsert,
} from "../models/project.model";
import { DatabaseService } from "./db";

export class ProjectsService extends Effect.Service<ProjectsService>()(
  "@mason/core/projectsService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DatabaseService;

      const createProjects = ({
        workspaceId,
        projectsToCreate,
      }: {
        workspaceId: typeof WorkspaceId.Type;
        projectsToCreate: Array<typeof ProjectToCreate.Type>;
      }) =>
        Effect.gen(function* () {
          const projects = projectsToCreate.map((p) =>
            Project.make({ workspaceId: workspaceId, ...p })
          );

          const createdProjects = yield* db.use((conn) =>
            conn.insert(projectsTable).values(projects).returning()
          );

          return createdProjects.map((p) =>
            Project.make({
              ...p,
              id: ProjectId.make(p.id),
              workspaceId: workspaceId,
            })
          );
        });

      const updateProjects = ({
        workspaceId,
        projectsToUpdate,
      }: {
        workspaceId: typeof WorkspaceId.Type;
        projectsToUpdate: Array<typeof ProjectToUpdate.Type>;
      }) =>
        Effect.gen(function* () {
          const projectIds = projectsToUpdate.map((p) => p.id);

          // Find existing projects
          const existingProjects = yield* db.use((conn) =>
            conn.query.projectsTable.findMany({
              where: ({ id }) => inArray(id, projectIds),
            })
          );

          // Merge update data with existing projects
          const projectsToUpdateInDb = existingProjects
            .map((existing) => {
              const updateData = projectsToUpdate.find(
                (p) => p.id === existing.id
              );
              if (!updateData) {
                return null;
              }

              return Project.make({
                ...existing,
                ...updateData,
                workspaceId: workspaceId,
              });
            })
            .filter(Boolean);

          // Update projects in database
          const updatedProjects = yield* db.withTransaction(
            Effect.gen(function* () {
              const results: Array<DbProject> = [];

              for (const project of projectsToUpdateInDb) {
                if (!project) {
                  continue;
                }

                const [updated] = yield* db.use((conn) =>
                  conn
                    .update(projectsTable)
                    .set(project)
                    .where(
                      and(
                        eq(projectsTable.workspaceId, workspaceId),
                        eq(projectsTable.id, project.id)
                      )
                    )
                    .returning()
                );
                results.push(updated);
              }

              return results;
            })
          );

          return updatedProjects.map((p) =>
            Project.make({
              ...p,
              id: ProjectId.make(p.id),
              workspaceId: workspaceId,
            })
          );
        });

      return {
        createProjects: createProjects,
        updateProjects: updateProjects,
        upsertProjects: ({
          workspaceId,
          projects,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          projects: Array<typeof ProjectToUpsert.Type>;
        }) =>
          Effect.gen(function* () {
            const results: Array<typeof Project.Type> = [];

            // For now we insert/update 1 by 1 to guarantee the return order.
            // This should be optimized with a proper upsert later
            for (const project of projects) {
              const res = yield* Match.value(project).pipe(
                Match.tag("ProjectToCreate", (p) =>
                  createProjects({
                    workspaceId: workspaceId,
                    projectsToCreate: [p],
                  })
                ),
                Match.tag("ProjectToUpdate", (p) =>
                  updateProjects({
                    workspaceId: workspaceId,
                    projectsToUpdate: [p],
                  })
                ),
                Match.exhaustive
              );

              results.push(res[0]);
            }

            return results;
          }),
        softDeleteProjects: ({
          workspaceId,
          projectIds,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          projectIds: Array<typeof ProjectId.Type>;
        }) =>
          Effect.gen(function* () {
            yield* db.use((conn) =>
              conn
                .update(projectsTable)
                .set({ deletedAt: new Date() })
                .where(
                  and(
                    eq(projectsTable.workspaceId, workspaceId),
                    inArray(projectsTable.id, projectIds)
                  )
                )
            );
          }),
        hardDeleteProjects: ({
          workspaceId,
          projectIds,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          projectIds: Array<typeof ProjectId.Type>;
        }) =>
          Effect.gen(function* () {
            yield* db.use((conn) =>
              conn
                .delete(projectsTable)
                .where(
                  and(
                    eq(projectsTable.workspaceId, workspaceId),
                    inArray(projectsTable.id, projectIds)
                  )
                )
            );
          }),
        listProjects: ({
          workspaceId,
          query,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          query?: {
            integrationKind?: "float"
          };
        }) =>
          Effect.gen(function* () {
            return yield* db.use((conn) =>
              conn.query.projectsTable.findMany({
                where: and(
                  eq(projectsTable.workspaceId, workspaceId),
                  query?.integrationKind ? sql`${projectsTable.metadata}->>'${query.integrationKind}Id' IS NOT NULL` : undefined,
                ),
              })
            );
          }),
      };
    }),
  }
) {}
