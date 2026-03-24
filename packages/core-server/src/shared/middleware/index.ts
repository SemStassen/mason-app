import { RequestContextResolver } from "@mason/auth";
import { SessionMiddleware, WorkspaceMiddleware } from "@mason/core/rpc";
import { SessionContext, WorkspaceContext } from "@mason/core/shared/auth";
import { Effect, Layer, Option } from "effect";
import { HttpRouter, HttpServerRequest } from "effect/unstable/http";
import { HttpApiError } from "effect/unstable/httpapi";

export const RpcSessionMiddlewareLayer = Layer.effect(
  SessionMiddleware,
  Effect.gen(function* () {
    const requestContextResolver = yield* RequestContextResolver;

    return (effect, options) =>
      Effect.gen(function* () {
        const sessionContext = yield* requestContextResolver
          .resolveSessionContext({ headers: options.headers })
          .pipe(
            Effect.catchTags({
              "auth/UnauthenticatedError": () =>
                Effect.fail(new HttpApiError.Unauthorized()),
            })
          );

        return yield* Effect.provideService(
          effect,
          SessionContext,
          sessionContext
        );
      });
  })
);

export const RpcWorkspaceMiddlewareLayer = Layer.effect(
  WorkspaceMiddleware,
  Effect.gen(function* () {
    const requestContextResolver = yield* RequestContextResolver;

    return (effect, _options) =>
      Effect.gen(function* () {
        const sessionContext = yield* Effect.serviceOption(SessionContext).pipe(
          Effect.flatMap(
            Option.match({
              onNone: () => Effect.fail(new HttpApiError.Forbidden()),
              onSome: Effect.succeed,
            })
          )
        );

        const workspaceContext = yield* requestContextResolver
          .resolveWorkspaceContext({
            sessionContext,
          })
          .pipe(
            Effect.catchTags({
              "auth/WorkspaceAccessDeniedError": () =>
                Effect.fail(new HttpApiError.Forbidden()),
            })
          );

        return yield* Effect.provideService(
          effect,
          WorkspaceContext,
          workspaceContext
        );
      });
  })
);

export const HttpSessionMiddleware = HttpRouter.middleware<{
  provides: SessionContext;
}>()(
  Effect.gen(function* () {
    const requestContextResolver = yield* RequestContextResolver;

    return (effect) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;

        const sessionContext = yield* requestContextResolver
          .resolveSessionContext({
            headers: request.headers,
          })
          .pipe(
            Effect.catchTags({
              "auth/UnauthenticatedError": () =>
                Effect.fail(new HttpApiError.Unauthorized()),
            })
          );

        return yield* Effect.provideService(
          effect,
          SessionContext,
          sessionContext
        );
      });
  })
);

export const HttpSessionMiddlewareLayer = HttpSessionMiddleware.layer;

export const HttpWorkspaceMiddleware = HttpRouter.middleware<{
  provides: WorkspaceContext;
}>()(
  Effect.gen(function* () {
    const requestContextResolver = yield* RequestContextResolver;

    return (effect) =>
      Effect.gen(function* () {
        const sessionContext = yield* Effect.serviceOption(SessionContext).pipe(
          Effect.flatMap(
            Option.match({
              onNone: () => Effect.fail(new HttpApiError.Forbidden()),
              onSome: Effect.succeed,
            })
          )
        );

        const workspaceContext = yield* requestContextResolver
          .resolveWorkspaceContext({
            sessionContext,
          })
          .pipe(
            Effect.catchTags({
              "auth/WorkspaceAccessDeniedError": () =>
                Effect.fail(new HttpApiError.Forbidden()),
            })
          );

        return yield* Effect.provideService(
          effect,
          WorkspaceContext,
          workspaceContext
        );
      });
  })
);
