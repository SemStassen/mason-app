import { TimeTrackingIntegrationAdapter } from "@mason/adapters";
import {
  type CreateWorkspaceIntegrationRequest,
  type DeleteWorkspaceIntegrationRequest,
  WorkspaceIntegrationResponse,
} from "@mason/api-contract/dto/workspace-integration.dto";
import {
  type ExistingMemberId,
  type ExistingWorkspaceId,
  PlainApiKey,
  WorkspaceIntegrationId,
} from "@mason/framework";
import { IntegrationModuleService } from "@mason/integration";
import { Effect, Redacted } from "effect";
import {
  InternalError,
  InvalidExternalApiKeyError,
  type NotFoundError,
} from "../errors";

export const createWorkspaceIntegration: (params: {
  workspaceId: ExistingWorkspaceId;
  createdByMemberId: ExistingMemberId;
  request: CreateWorkspaceIntegrationRequest;
}) => Effect.Effect<
  WorkspaceIntegrationResponse,
  InternalError | InvalidExternalApiKeyError,
  IntegrationModuleService
> = Effect.fn("@mason/core-flows/createWorkspaceIntegration")(
  function* ({ workspaceId, createdByMemberId, request }) {
    const integrationService = yield* IntegrationModuleService;

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
          {
            kind: request.kind,
            plainApiKey: Redacted.make(
              PlainApiKey.from.make(request.apiKeyUnencrypted)
            ),
          },
        ],
      })
      .pipe(
        Effect.flatMap((integrations) => {
          const integration = integrations[0];
          return integration
            ? Effect.succeed(WorkspaceIntegrationResponse.make(integration))
            : Effect.fail(
                new InternalError({
                  cause: "Failed to create workspace integration",
                })
              );
        })
      );
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

    return yield* integrationService.hardDeleteWorkspaceIntegrations({
      workspaceId,
      workspaceIntegrationIds: [
        WorkspaceIntegrationId.make(workspaceIntegrationId.id),
      ],
    });
  },
  Effect.catchAll((e) => new InternalError({ cause: e }))
);

export const listWorkspaceIntegrations: (params: {
  workspaceId: ExistingWorkspaceId;
}) => Effect.Effect<
  ReadonlyArray<WorkspaceIntegrationResponse>,
  InternalError,
  IntegrationModuleService
> = Effect.fn("@mason/core-flows/listWorkspaceIntegrations")(
  function* (params) {
    const integrationService = yield* IntegrationModuleService;

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
