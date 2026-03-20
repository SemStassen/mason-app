import { RequestContextResolver } from "@mason/core-server/shared/request-context-resolver";
import { WorkspaceMiddleware } from "@mason/core/rpc";
import { SessionContext, WorkspaceContext } from "@mason/core/shared/auth";
import { Effect, Layer, Option } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const WorkspaceMiddlewareLayer = Layer.effect(
  WorkspaceMiddleware,
  Effect.gen(function* () {
    const requestContextResolver = yield* RequestContextResolver;

    return (effect, _options) =>
      Effect.gen(function* () {
        const sessionContext = yield* Effect.serviceOption(SessionContext).pipe(
          Effect.flatMap(
            Option.match({
              onNone: () => Effect.fail(new HttpApiError.Forbidden()),
              onSome: (s) => Effect.succeed(s),
            })
          )
        );

        const workspaceContext = yield* requestContextResolver
          .resolveWorkspaceContext({
            sessionContext: sessionContext,
          })
          .pipe(Effect.mapError(() => new HttpApiError.Forbidden()));

        return yield* Effect.provideService(
          effect,
          WorkspaceContext,
          workspaceContext
        );
      });
  })
);
