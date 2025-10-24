import { HttpApiBuilder, HttpApiError } from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { WorkspaceIntegrationResponse } from "@mason/api-contract/dto/workspace-integration.dto";
import {
  createWorkspaceIntegrationUseCase,
  deleteWorkspaceIntegrationUseCase,
  listWorkspaceIntegrationsUseCase,
  updateWorkspaceIntegrationUseCase,
} from "@mason/use-cases/workspace-integrations.use-cases";
import { Effect } from "effect";
import { RequestContext } from "~/middleware/auth.middleware";

export const WorkspaceIntegrationsGroupLive = HttpApiBuilder.group(
  MasonApi,
  "WorkspaceIntegration",
  (handlers) =>
    Effect.gen(function* () {
      return handlers
        .handle("Create", ({ payload }) =>
          Effect.gen(function* () {
            const ctx = yield* RequestContext;

            const createdWorkspaceIntegration =
              yield* createWorkspaceIntegrationUseCase({
                workspaceId: ctx.workspaceId,
                createdByMemberId: ctx.memberId,
                request: payload,
              });

            return WorkspaceIntegrationResponse.make(
              createdWorkspaceIntegration
            );
          }).pipe(
            Effect.tapError((e) => Effect.logError(e)),
            Effect.catchTags({
              "@mason/integrations/integrationInvalidApiKeyError": () =>
                new HttpApiError.Unauthorized(),
            }),
            Effect.mapError(() => new HttpApiError.InternalServerError())
          )
        )
        .handle("Update", ({ payload, path }) =>
          Effect.gen(function* () {
            const ctx = yield* RequestContext;

            const updatedWorkspaceIntegration =
              yield* updateWorkspaceIntegrationUseCase({
                workspaceId: ctx.workspaceId,
                request: {
                  id: path.id,
                  ...payload,
                },
              });

            return WorkspaceIntegrationResponse.make(
              updatedWorkspaceIntegration
            );
          }).pipe(
            Effect.tapError((e) => Effect.logError(e)),
            Effect.mapError(() => new HttpApiError.InternalServerError())
          )
        )
        .handle("Delete", ({ path }) =>
          Effect.gen(function* () {
            const ctx = yield* RequestContext;

            yield* deleteWorkspaceIntegrationUseCase({
              workspaceId: ctx.workspaceId,
              request: {
                id: path.id,
              },
            });
          }).pipe(
            Effect.tapError((e) => Effect.logError(e)),
            Effect.mapError(() => new HttpApiError.InternalServerError())
          )
        )
        .handle("List", () =>
          Effect.gen(function* () {
            const ctx = yield* RequestContext;

            const workspaceIntegrations =
              yield* listWorkspaceIntegrationsUseCase({
                workspaceId: ctx.workspaceId,
              });

            return workspaceIntegrations.map((integration) =>
              WorkspaceIntegrationResponse.make(integration)
            );
          }).pipe(
            Effect.tapError((e) => Effect.logError(e)),
            Effect.mapError(() => new HttpApiError.InternalServerError())
          )
        );
    })
);
