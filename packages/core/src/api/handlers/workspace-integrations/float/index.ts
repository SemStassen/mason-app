import { HttpApiBuilder, HttpApiError } from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { workspaceIntegrationsTable } from "@mason/db/schema";
import { Effect } from "effect";
import { DatabaseService } from "~/services/db";
import { RequestContextService } from "~/services/request-context";
import { encrypt } from "~/utils/encryption";

export const FloatWorkspaceIntegrationGroupLive = HttpApiBuilder.group(
  MasonApi,
  "FloatWorkspaceIntegration",
  (handlers) =>
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      return handlers.handle("SetApiKey", ({ payload }) =>
        Effect.gen(function* () {
          const ctx = yield* RequestContextService;

          const encryptedApiKey = yield* encrypt(payload.apiKey);

          yield* db.use((conn) =>
            conn.insert(workspaceIntegrationsTable).values({
              workspaceId: ctx.workspaceId,
              kind: "float",
              apiKeyEncrypted: encryptedApiKey,
            })
          );
        }).pipe(
          Effect.provide(RequestContextService.Default),
          Effect.mapError(() => new HttpApiError.InternalServerError())
        )
      );
    })
);
