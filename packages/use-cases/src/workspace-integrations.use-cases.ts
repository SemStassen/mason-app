import type {
  CreateWorkspaceIntegrationRequest,
  DeleteWorkspaceIntegrationRequest,
  UpdateWorkspaceIntegrationRequest,
} from "@mason/api-contract/dto/workspace-integration.dto";
import {
  type MemberId,
  type WorkspaceId,
  WorkspaceIntegrationId,
} from "@mason/core/models/ids";
import {
  WorkspaceIntegrationToCreate,
  WorkspaceIntegrationToUpdate,
} from "@mason/core/models/workspace-integration.model";
import { WorkspaceIntegrationsService } from "@mason/core/services/workspace-integrations.service";
import { TimeTrackingIntegrationAdapter } from "@mason/integrations";
import { Effect } from "effect";

export const createWorkspaceIntegrationUseCase = Effect.fn("createWorkspaceIntegrationUseCase")(function* ({
  workspaceId,
  createdByMemberId,
  request,
  }: {
    workspaceId: typeof WorkspaceId.Type;
    createdByMemberId: typeof MemberId.Type;
    request: typeof CreateWorkspaceIntegrationRequest.Type;
  }) {
    return yield* Effect.gen(function* () {
    const workspaceIntegrationsService = yield* WorkspaceIntegrationsService;
    const integrationService = yield* TimeTrackingIntegrationAdapter;

    yield* integrationService.testIntegration({
      apiKeyUnencrypted: request.apiKeyUnencrypted,
    });

    return yield* workspaceIntegrationsService.createWorkspaceIntegration({
      workspaceId: workspaceId,
      createdByMemberId: createdByMemberId,
        workspaceIntegration: WorkspaceIntegrationToCreate.make(request),
      });
    }).pipe(Effect.provide(TimeTrackingIntegrationAdapter.getLayer(request.kind)));
  });

export const updateWorkspaceIntegrationUseCase = Effect.fn("updateWorkspaceIntegrationUseCase")(function* ({
  workspaceId,
  request,
}: {
    workspaceId: typeof WorkspaceId.Type;
    request: typeof UpdateWorkspaceIntegrationRequest.Type;
  }) {
  const workspaceIntegrationsService = yield* WorkspaceIntegrationsService;

  return yield* workspaceIntegrationsService.updateWorkspaceIntegration({
    workspaceId: workspaceId,
    workspaceIntegration: WorkspaceIntegrationToUpdate.make({
      ...request,
      id: WorkspaceIntegrationId.make(request.id),
    }),
  });
});

export const deleteWorkspaceIntegrationUseCase = Effect.fn("deleteWorkspaceIntegrationUseCase")(function* ({
  workspaceId,
  request,
}: {
  workspaceId: typeof WorkspaceId.Type;
  request: typeof DeleteWorkspaceIntegrationRequest.Type;
  }) {
    const workspaceIntegrationsService = yield* WorkspaceIntegrationsService;

    return yield* workspaceIntegrationsService.hardDeleteWorkspaceIntegration({
      workspaceId: workspaceId,
      id: WorkspaceIntegrationId.make(request.id),
    });
  });

export const listWorkspaceIntegrationsUseCase = Effect.fn("listWorkspaceIntegrationsUseCase")(function* ({
  workspaceId,
}: {
  workspaceId: typeof WorkspaceId.Type;
  }) {
    const workspaceIntegrationsService = yield* WorkspaceIntegrationsService;

    return yield* workspaceIntegrationsService.listWorkspaceIntegrations({
      workspaceId: workspaceId,
    });
  });
