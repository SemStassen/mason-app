import { TimeTrackingIntegrationAdapter } from "@mason/adapters";
import {
  type CreateWorkspaceIntegrationRequest,
  type DeleteWorkspaceIntegrationRequest,
  WorkspaceIntegrationResponse,
} from "@mason/api-contract/dto/workspace-integration.dto";
import {
  ApiKey,
  type MemberId,
  type WorkspaceId,
  WorkspaceIntegrationId,
} from "@mason/framework/types";
import {
  IntegrationService,
  WorkspaceIntegrationToCreate,
} from "@mason/integration";
import { Effect } from "effect";
import { InternalError } from "../errors";

export const createWorkspaceIntegration: (params: {
  workspaceId: WorkspaceId;
  createdByMemberId: MemberId;
  request: CreateWorkspaceIntegrationRequest;
}) => Effect.Effect<
  WorkspaceIntegrationResponse,
  InternalError,
  IntegrationService
> = Effect.fn("@mason/core-flows/createWorkspaceIntegration")(
  function* (params) {
    const workspaceIntegrationService = yield* IntegrationService;

    yield* Effect.flatMap(TimeTrackingIntegrationAdapter, (adapter) =>
      adapter.testIntegration({
        apiKey: ApiKey.make(params.request.apiKeyUnencrypted),
      })
    ).pipe(
      Effect.provide(
        TimeTrackingIntegrationAdapter.getLayer(params.request.kind)
      )
    );

    return yield* workspaceIntegrationService
      .createWorkspaceIntegration({
        workspaceId: params.workspaceId,
        createdByMemberId: params.createdByMemberId,
        workspaceIntegration: WorkspaceIntegrationToCreate.make({
          kind: params.request.kind,
          apiKeyUnencrypted: params.request.apiKeyUnencrypted,
        }),
      })
      .pipe(Effect.map(WorkspaceIntegrationResponse.make));
  },
  Effect.mapError((e) => new InternalError({ cause: e }))
);

export const deleteWorkspaceIntegration: (params: {
  workspaceId: WorkspaceId;
  workspaceIntegrationId: DeleteWorkspaceIntegrationRequest;
}) => Effect.Effect<void, InternalError, IntegrationService> = Effect.fn(
  "@mason/core-flows/deleteWorkspaceIntegration"
)(
  function* (params) {
    const workspaceIntegrationService = yield* IntegrationService;
    return yield* workspaceIntegrationService.hardDeleteWorkspaceIntegration({
      workspaceId: params.workspaceId,
      workspaceIntegrationId: WorkspaceIntegrationId.make(
        params.workspaceIntegrationId.id
      ),
    });
  },
  Effect.mapError((e) => new InternalError({ cause: e }))
);

export const listWorkspaceIntegrations: (params: {
  workspaceId: WorkspaceId;
}) => Effect.Effect<
  ReadonlyArray<WorkspaceIntegrationResponse>,
  InternalError,
  IntegrationService
> = Effect.fn("@mason/core-flows/listWorkspaceIntegrations")(
  function* (params) {
    const workspaceIntegrationService = yield* IntegrationService;
    return yield* workspaceIntegrationService
      .listWorkspaceIntegrations({
        workspaceId: params.workspaceId,
      })
      .pipe(
        Effect.map((items) =>
          items.map((item) => WorkspaceIntegrationResponse.make(item))
        )
      );
  },
  Effect.mapError((e) => new InternalError({ cause: e }))
);
