import { HttpApiBuilder, HttpApiError } from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { syncIntegrationUseCase } from "@mason/use-cases/sync.use-cases";
import { Effect } from "effect";
import { RequestContext } from "~/middleware/auth.middleware";

export const FloatWorkspaceIntegrationGroupLive = HttpApiBuilder.group(
  MasonApi,
  "FloatWorkspaceIntegration",
  (handlers) =>
    handlers.handle("Sync", () =>
      Effect.gen(function* () {
        const ctx = yield* RequestContext;

        yield* syncIntegrationUseCase({
          kind: "float",
          workspaceId: ctx.workspaceId,
        });
      }).pipe(
        Effect.tapError((e) => Effect.logError(e)),
        Effect.mapError(() => new HttpApiError.InternalServerError()),
      ),
    ),
);
