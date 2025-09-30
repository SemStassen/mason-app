import type { UpsertWorkspaceIntegrationRequest } from "@mason/api-contract/dto/workspace-integration.dto";
import { WorkspaceIntegrationsService } from "@mason/core/services/workspace-integrations";
import {
  TimeTrackingIntegrationAdapter,
} from "@mason/integrations";
import { Effect } from "effect";
import { WorkspaceId, ProjectId } from "@mason/core/models/ids";
import { ProjectToCreate } from "@mason/core/models/project.model";
import { ProjectsService } from "@mason/core/services/projects";
import { DatabaseService } from "@mason/core/services/db";

export const upsertWorkspaceIntegrationUseCase = ({
  workspaceId,
  request,
}: {
  workspaceId: typeof WorkspaceId.Type;
  request: typeof UpsertWorkspaceIntegrationRequest.Type;
}) =>
  Effect.gen(function* () {
    const workspaceIntegrationsService = yield* WorkspaceIntegrationsService;
    const integrationService = yield* TimeTrackingIntegrationAdapter;

    yield* integrationService.testIntegration({
      workspaceId,
      apiKeyUnencrypted: request.apiKeyUnencrypted,
    });

    return yield* workspaceIntegrationsService.upsertWorkspaceIntegration({
      workspaceId: workspaceId,
      workspaceIntegration: request
    });
  }).pipe(
    Effect.provide(TimeTrackingIntegrationAdapter.getLayer(request.kind)),
  );

export const syncIntegrationProjectsUseCase = ({
  workspaceId,
  kind,
  projects,
}: {
  workspaceId: typeof WorkspaceId.Type;
  kind: "float";
  projects: Array<typeof ProjectToCreate.Type>;
}) =>
  Effect.gen(function* () {
    const db = yield* DatabaseService;
    const projectsService = yield* ProjectsService;

    const existingProjects = yield* projectsService.listProjects({
      workspaceId: workspaceId,
      query: {
        integrationKind: kind,
      },
    });

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
        projectsService.upsertProjects({
          workspaceId: workspaceId,
          projects: [...projectsToCreate, ...projectsToUpdate],
        }),
        projectsService.softDeleteProjects({
          workspaceId: workspaceId,
          projectIds: projectsToDelete.map((p) => ProjectId.make(p.id)),
        }),
      ])
    );
  });