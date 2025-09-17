import {
  type CreateProjectRequest,
  Project,
  type UpdateProjectRequest,
  type UpsertProjectRequest,
} from "@mason/api-contract/models/project.model";
import { ProjectId, WorkspaceId } from "@mason/api-contract/models/shared";
import { and, eq, inArray } from "@mason/db/operators";
import { type DbProject, projectsTable } from "@mason/db/schema";
import { Effect, Match } from "effect";
import { DatabaseService } from "./db";
import { RequestContextService } from "./request-context";

export class ProjectsService extends Effect.Service<ProjectsService>()(
  "@mason/ProjectsService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DatabaseService;

      const createProjects = (
        projectsToCreate: Array<typeof CreateProjectRequest.Type>
      ) =>
        Effect.gen(function* () {
          const ctx = yield* RequestContextService;
          const workspaceId = WorkspaceId.make(ctx.workspaceId);

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

      const updateProjects = (
        projectsToUpdate: Array<typeof UpdateProjectRequest.Type>
      ) =>
        Effect.gen(function* () {
          const ctx = yield* RequestContextService;
          const workspaceId = WorkspaceId.make(ctx.workspaceId);

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
        upsertProjects: (projects: Array<typeof UpsertProjectRequest.Type>) =>
          Effect.gen(function* () {
            const results: Array<typeof Project.Type> = [];

            // For now we insert/update 1 by 1 to guarantee the return order.
            // This should be optimized with a proper upsert later
            for (const project of projects) {
              const res = yield* Match.value(project).pipe(
                Match.tag("CreateProject", (p) => createProjects([p])),
                Match.tag("UpdateProject", (p) => updateProjects([p])),
                Match.exhaustive
              );

              results.push(res[0]);
            }

            return results;
          }),
      };
    }),
  }
) {}
