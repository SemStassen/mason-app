import { TimeTrackingIntegrationAdapter } from "@mason/adapters";
import {
  type CreateWorkspaceIntegrationRequest,
  type DeleteWorkspaceIntegrationRequest,
  WorkspaceIntegrationResponse,
} from "@mason/api-contract/dto/workspace-integration.dto";
import {
  type MemberId,
  PlainApiKey,
  type WorkspaceId,
  WorkspaceIntegrationId,
} from "@mason/framework";
import {
  IntegrationService,
  WorkspaceIntegrationToCreate,
} from "@mason/integration";
import { Effect, Redacted } from "effect";
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
  function* ({ workspaceId, createdByMemberId, request }) {
    const integrationService = yield* IntegrationService;

    yield* Effect.flatMap(TimeTrackingIntegrationAdapter, (adapter) =>
      adapter.testIntegration({
        apiKey: Redacted.make(PlainApiKey.from.make(request.apiKeyUnencrypted)),
      })
    ).pipe(
      Effect.provide(TimeTrackingIntegrationAdapter.getLayer(request.kind))
    );

    return yield* integrationService
      .createWorkspaceIntegrations({
        workspaceId,
        createdByMemberId,
        workspaceIntegrations: [
          WorkspaceIntegrationToCreate.make({
            kind: request.kind,
            plainApiKey: Redacted.make(
              PlainApiKey.from.make(request.apiKeyUnencrypted)
            ),
          }),
        ],
      })
      .pipe(
        Effect.map((integrations) =>
          integrations.map((integration) =>
            WorkspaceIntegrationResponse.make(integration)
          )
        )
      );
  },
  Effect.mapError((e) => new InternalError({ cause: e }))
);

export const deleteWorkspaceIntegration: (params: {
  workspaceId: WorkspaceId;
  workspaceIntegrationId: DeleteWorkspaceIntegrationRequest;
}) => Effect.Effect<void, InternalError, IntegrationService> = Effect.fn(
  "@mason/core-flows/deleteWorkspaceIntegration"
)(
  function* ({ workspaceId, workspaceIntegrationId }) {
    const integrationService = yield* IntegrationService;

    return yield* integrationService.hardDeleteWorkspaceIntegrations({
      workspaceId,
      workspaceIntegrationIds: [
        WorkspaceIntegrationId.make(workspaceIntegrationId.id),
      ],
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
    const integrationService = yield* IntegrationService;

    return yield* integrationService
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
