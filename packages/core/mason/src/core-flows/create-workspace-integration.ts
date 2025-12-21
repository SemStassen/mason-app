import { TimeTrackingIntegrationAdapter } from "@mason/integrations";
import { IntegrationService, WorkspaceIntegrationToCreate } from "@mason/framework/platform";
import { Effect } from "effect";
import type { MemberId, WorkspaceId } from "@mason/framework/types/ids";
import type { CreateWorkspaceIntegrationRequest } from "@mason/api-contract/dto/workspace-integration.dto";

export const createWorkspaceIntegration = Effect.fn("createWorkspaceIntegration")(function* (params: {
  workspaceId: WorkspaceId;
  createdByMemberId: MemberId;
  request: CreateWorkspaceIntegrationRequest;
}) {
  const integrationAdapter = yield* TimeTrackingIntegrationAdapter;
  const workspaceIntegrationService = yield* IntegrationService;

  yield* integrationAdapter.testIntegration({
    apiKeyUnencrypted: params.request.apiKeyUnencrypted,
  });

  return yield* workspaceIntegrationService.createWorkspaceIntegration({
    workspaceId: params.workspaceId,
    createdByMemberId: params.createdByMemberId,
    workspaceIntegration: WorkspaceIntegrationToCreate.make({
      kind: params.request.kind,
      apiKeyUnencrypted: params.request.apiKeyUnencrypted,
    }),
  }).pipe(Effect.provide(TimeTrackingIntegrationAdapter.getLayer(params.request.kind)));;
})