import { HttpApiError, HttpServerRequest } from "@effect/platform";
import {
  SessionData,
  SessionMiddleware,
} from "@mason/api-contract/middleware/session";
import { MemberId, UserId, WorkspaceId } from "@mason/core/models/ids";
import { AuthService } from "@mason/core/services/auth.service";
import { Effect, Layer } from "effect";


export const SessionMiddlewareLive = Layer.effect(
  SessionMiddleware,
  Effect.gen(function* () {
    const authService = yield* AuthService;

    return SessionMiddleware.of(
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;

        const session = yield* authService
        .use((client) =>
          client.api.getSession({
            headers: new Headers(request.headers),
          })
        )
        .pipe(Effect.catchAll(() => Effect.succeed(null)));

      if (!session?.session.activeWorkspaceId) {
        return yield* Effect.fail(new HttpApiError.Unauthorized());
      }

        // TODO: You may need to fetch memberId from workspace membership
        return new SessionData({
          userId: UserId.make(session.session.userId),
          memberId: MemberId.make(session.session.userId), // placeholder - fetch real memberId
          workspaceId: WorkspaceId.make(session.session.activeWorkspaceId),
        });
      })
    );
  })
);
