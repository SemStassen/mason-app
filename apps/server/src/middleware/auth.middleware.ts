import { HttpApiError, HttpServerRequest } from "@effect/platform";
import { AuthMiddleware, AuthData } from "@mason/api-contract/middleware/auth";
import { UserId } from "@mason/core/models/ids";
import { AuthService } from "@mason/core/services/auth.service";
import { Effect, Layer } from "effect";

// Technically this does not need to be bearer based anymore. Since better auth just checks the headers anyways.
// Which might be browser cookies or Authorization header.
export const AuthMiddlewareLive = Layer.effect(
  AuthMiddleware,
  Effect.gen(function* () {
    const authService = yield* AuthService;
    return {
      bearer: () =>
        Effect.gen(function* () {
          const request = yield* HttpServerRequest.HttpServerRequest;

          const session = yield* authService
            .use((client) =>
              client.api.getSession({
                headers: new Headers(request.headers),
              })
            )
            .pipe(Effect.catchAll(() => Effect.succeed(null)));

          if (!session) {
            return yield* Effect.fail(new HttpApiError.Unauthorized());
          }

          // Store session for downstream middlewares
          // yield* FiberRef.set(CurrentSession, session);

          return new AuthData({
            userId: UserId.make(session.session.userId),
          });
        }),
    };
  })
);
