import { HttpApiBuilder, HttpApiError } from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { workspaceIntegrationsTable } from "@mason/db/schema";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { WorkspaceId, WorkspaceIntegrationId } from "~/models/shared";
import { WorkspaceIntegration } from "~/models/workspace-integration.model";
import { DatabaseService } from "~/services/db";
import { RequestContextService } from "~/services/request-context";

export const WorkspaceIntegrationsGroupLive = HttpApiBuilder.group(
  MasonApi,
  "WorkspaceIntegrations",
  (handlers) =>
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      return handlers.handle("ListIntegrations", () =>
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
            WorkspaceIntegration.make({
              ...integration,
              id: WorkspaceIntegrationId.make(integration.id),
              workspaceId: WorkspaceId.make(integration.workspaceId),
            })
          );
        }).pipe(
          Effect.provide(RequestContextService.Default),
          Effect.mapError(() => new HttpApiError.InternalServerError())
        )
      );
    })
);
