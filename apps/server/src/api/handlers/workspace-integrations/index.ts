import { HttpApiBuilder, HttpApiError } from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { WorkspaceIntegrationResponse } from "@mason/api-contract/dto/workspace-integration.dto";
import { DatabaseService } from "@mason/core/services/db";
import { RequestContextService } from "@mason/core/services/request-context";
import { WorkspaceIntegrationsService } from "@mason/core/services/workspace-integrations";
import { workspaceIntegrationsTable } from "@mason/db/schema";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

export const WorkspaceIntegrationsGroupLive = HttpApiBuilder.group(
  MasonApi,
  "WorkspaceIntegrations",
  (handlers) =>
    Effect.gen(function* () {
      const workspaceIntegrationsService = yield* WorkspaceIntegrationsService;
      const db = yield* DatabaseService;

      return handlers
        .handle("SetApiKey", ({ payload }) =>
          workspaceIntegrationsService
            .upsertWorkspaceIntegration({
              workspaceIntegration: {
                kind: "float",
                apiKey: payload.apiKey,
              },
            })
            .pipe(
              Effect.provide(RequestContextService.Default),
              Effect.mapError(() => new HttpApiError.InternalServerError())
            )
        )
        .handle("ListIntegrations", () =>
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
              WorkspaceIntegrationResponse.make({
                ...integration,
                id: integration.id,
                workspaceId: integration.workspaceId,
              })
            );
          }).pipe(
            Effect.provide(RequestContextService.Default),
            Effect.mapError(() => new HttpApiError.InternalServerError())
          )
        );
    })
);
