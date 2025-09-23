import { and, eq, sql } from "@mason/db/operators";
import { projectsTable, workspaceIntegrationsTable } from "@mason/db/schema";
import { Effect } from "effect";
import type { ProjectToCreate } from "../models/project.model";
import { ProjectId, WorkspaceId, WorkspaceIntegrationId } from "../models/shared";
import {
  WorkspaceIntegration,
  type WorkspaceIntegrationToUpsert,
} from "../models/workspace-integration.model";
import { encrypt } from "../utils/encryption";
import { DatabaseService } from "./db";
import { ProjectsService } from "./projects";
import { RequestContextService } from "./request-context";

export class WorkspaceIntegrationsService extends Effect.Service<WorkspaceIntegrationsService>()(
  "@mason/WorkspaceIntegrationsService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DatabaseService;
      const projectsService = yield* ProjectsService;

      return {
        upsertWorkspaceIntegration: ({
          workspaceIntegration,
        }: {
          workspaceIntegration: typeof WorkspaceIntegrationToUpsert.Type;
        }) =>
          Effect.gen(function* () {
            const ctx = yield* RequestContextService;

            const encryptedApiKey = yield* encrypt(workspaceIntegration.apiKey);

            const existingWorkspaceIntegration = yield* db.use((conn) =>
              conn.query.workspaceIntegrationsTable.findFirst({
                where: and(
                  eq(workspaceIntegrationsTable.workspaceId, ctx.workspaceId),
                  eq(workspaceIntegrationsTable.kind, workspaceIntegration.kind)
                ),
              })
            );

            if (existingWorkspaceIntegration) {
              yield* db.use((conn) =>
                conn
                  .update(workspaceIntegrationsTable)
                  .set({ apiKeyEncrypted: encryptedApiKey })
                  .where(
                    eq(
                      workspaceIntegrationsTable.id,
                      existingWorkspaceIntegration.id
                    )
                  )
              );
            } else {
              yield* db.use((conn) =>
                conn
                  .insert(workspaceIntegrationsTable)
                  .values({
                    workspaceId: ctx.workspaceId,
                    apiKeyEncrypted: encryptedApiKey,
                    ...workspaceIntegration,
                  })
                  .returning()
              );
            }
          }),
        listWorkspaceIntegrations: () =>
          Effect.gen(function* () {
            const ctx = yield* RequestContextService;

            const workspaceIntegrations = yield* db.use((conn) =>
              conn.query.workspaceIntegrationsTable.findMany({
                where: eq(
                  workspaceIntegrationsTable.workspaceId,
                  ctx.workspaceId
                ),
              })
            );

            return workspaceIntegrations.map((integration) =>
              WorkspaceIntegration.make({
                ...integration,
                id: WorkspaceIntegrationId.make(integration.id),
                workspaceId: WorkspaceId.make(integration.workspaceId),
              })
            );
          }),
        syncFloatProjects: ({
          projects,
        }: {
          projects: Array<typeof ProjectToCreate.Type>;
        }) =>
          Effect.gen(function* () {
            const ctx = yield* RequestContextService;
            const existingProjects = yield* db.use((conn) =>
              conn.query.projectsTable.findMany({
                where: and(
                  eq(projectsTable.workspaceId, ctx.workspaceId),
                  sql`${projectsTable.metadata}->>'floatId' IS NOT NULL`
                ),
              })
            );

            const projectsToCreate = projects.filter(
              (p) =>
                !existingProjects.some(
                  (existing) =>
                    existing.metadata?.floatId === p.metadata?.floatId
                )
            );

            const projectsToUpdate = projects.filter((p) =>
              existingProjects.some(
                (existing) => existing.metadata?.floatId === p.metadata?.floatId
              )
            );

            const projectsToDelete = existingProjects.filter(
              (p) =>
                !projects.some(
                  (existing) =>
                    existing.metadata?.floatId === p.metadata?.floatId
                )
            );
            yield* db.withTransaction(
              Effect.all([
                projectsService.upsertProjects(projectsToCreate),
                projectsService.upsertProjects(projectsToUpdate),
                projectsService.softDeleteProjects(
                  projectsToDelete.map((p) => ProjectId.make(p.id))
                ),
              ])
            );
          }),
      };
    }),
  }
) {}
