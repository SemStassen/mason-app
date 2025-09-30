import { HttpApiBuilder, HttpApiError } from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { WorkspaceIntegrationResponse } from "@mason/api-contract/dto/workspace-integration.dto";
import { WorkspaceIntegrationId } from "@mason/core/models/ids";
import { WorkspaceIntegrationsService } from "@mason/core/services/workspace-integrations";
import { Effect } from "effect";
import { RequestContext } from "~/middleware";
import { upsertWorkspaceIntegrationUseCase } from "@mason/use-cases/workspace-integrations";

export const WorkspaceIntegrationsGroupLive = HttpApiBuilder.group(
  MasonApi,
  "WorkspaceIntegrations",
  (handlers) =>
    Effect.gen(function* () {
      const workspaceIntegrationsService = yield* WorkspaceIntegrationsService;

      return handlers
        .handle("Upsert", ({ payload }) =>
          Effect.gen(function* () {
            const ctx = yield* RequestContext;
            
            const upsertedWorkspaceIntegration = yield* upsertWorkspaceIntegrationUseCase({
              workspaceId: ctx.workspaceId,
              request: payload,
            });

            return WorkspaceIntegrationResponse.make(upsertedWorkspaceIntegration);
          }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
        )
        .handle("Delete", ({ path }) =>
          Effect.gen(function* () {
            const ctx = yield* RequestContext;

            yield* workspaceIntegrationsService.deleteWorkspaceIntegration({
              workspaceId: ctx.workspaceId,
              id: WorkspaceIntegrationId.make(path.id),
            });
            
          }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
        )
        .handle("List", () =>
          Effect.gen(function* () {
            const ctx = yield* RequestContext;

            const workspaceIntegrations = yield* workspaceIntegrationsService.listWorkspaceIntegrations({
              workspaceId: ctx.workspaceId,
            });

            return workspaceIntegrations.map((integration) =>
              WorkspaceIntegrationResponse.make(integration)
            );
          }).pipe(Effect.mapError(() => new HttpApiError.InternalServerError()))
        );
    })
);
