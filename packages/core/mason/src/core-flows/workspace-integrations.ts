import { TimeTrackingIntegrationAdapter } from "@mason/adapters";
import type { DeleteWorkspaceIntegrationRequest } from "@mason/api-contract/dto/workspace-integration.dto";
import {
  type ExistingMemberId,
  type ExistingWorkspaceId,
  WorkspaceIntegrationId,
} from "@mason/framework";
import {
  IntegrationModuleService,
  type WorkspaceIntegration,
  type WorkspaceIntegrationToCreateDTO,
} from "@mason/integration";
import { Effect } from "effect";
import {
  InternalError,
  InvalidExternalApiKeyError,
  type NotFoundError,
} from "../errors";

export const createWorkspaceIntegration: (params: {
  workspaceId: ExistingWorkspaceId;
  createdByMemberId: ExistingMemberId;
  request: WorkspaceIntegrationToCreateDTO;
}) => Effect.Effect<
  WorkspaceIntegration,
  InternalError | InvalidExternalApiKeyError,
  IntegrationModuleService
> = Effect.fn("@mason/core-flows/createWorkspaceIntegration")(
  function* ({ workspaceId, createdByMemberId, request }) {
    const integrationService = yield* IntegrationModuleService;

    yield* Effect.flatMap(TimeTrackingIntegrationAdapter, (adapter) =>
      adapter.testIntegration({
        apiKey: request.plainApiKey,
      })
    ).pipe(
      Effect.provide(TimeTrackingIntegrationAdapter.getLayer(request.kind))
    );

    return yield* integrationService.createWorkspaceIntegration({
      workspaceId,
      createdByMemberId,
      workspaceIntegration: request,
    });
  },
  Effect.mapError((e) => {
    if (e._tag === "adapters/InvalidApiKeyError") {
      return new InvalidExternalApiKeyError({ cause: e });
    }
    return new InternalError({ cause: e });
  })
);

export const deleteWorkspaceIntegration: (params: {
  workspaceId: ExistingWorkspaceId;
  workspaceIntegrationId: DeleteWorkspaceIntegrationRequest;
}) => Effect.Effect<
  void,
  InternalError | NotFoundError,
  IntegrationModuleService
> = Effect.fn("@mason/core-flows/deleteWorkspaceIntegration")(
  function* ({ workspaceId, workspaceIntegrationId }) {
    const integrationService = yield* IntegrationModuleService;

    return yield* integrationService.hardDeleteWorkspaceIntegration({
      workspaceId,
      workspaceIntegrationId: WorkspaceIntegrationId.make(
        workspaceIntegrationId.id
      ),
    });
  },
  Effect.catchAll((e) => new InternalError({ cause: e }))
);

export const listWorkspaceIntegrations: (params: {
  workspaceId: ExistingWorkspaceId;
}) => Effect.Effect<
  ReadonlyArray<WorkspaceIntegration>,
  InternalError,
  IntegrationModuleService
> = Effect.fn("@mason/core-flows/listWorkspaceIntegrations")(
  function* (params) {
    const integrationService = yield* IntegrationModuleService;

    return yield* integrationService.listWorkspaceIntegrations({
      workspaceId: params.workspaceId,
    });
  },
  Effect.mapError((e) => new InternalError({ cause: e }))
);
