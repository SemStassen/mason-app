import { RequestContextResolver } from "@mason/core-server/shared/request-context-resolver";
import { SessionMiddleware } from "@mason/core/rpc";
import { SessionContext } from "@mason/core/shared/auth";
import { Effect, Layer } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const SessionMiddlewareLayer = Layer.effect(
  SessionMiddleware,
  Effect.gen(function* () {
    const requestContextResolver = yield* RequestContextResolver;

    return (effect, options) =>
      Effect.gen(function* () {
        const sessionContext = yield* requestContextResolver
          .resolveSessionContext({ headers: options.headers })
          .pipe(Effect.mapError(() => new HttpApiError.Unauthorized()));

        return yield* Effect.provideService(
          effect,
          SessionContext,
          sessionContext
        );
      });
  })
);
