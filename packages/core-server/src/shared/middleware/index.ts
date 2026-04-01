import { RequestContextResolver } from "@mason/auth";
import { RpcSessionMiddleware, RpcWorkspaceMiddleware } from "@mason/core/rpc";
import { SessionContext, WorkspaceContext } from "@mason/core/shared/auth";
import { WORKSPACE_ID_HEADER } from "@mason/core/shared/headers";
import { WorkspaceId } from "@mason/core/shared/schemas";
import { Effect, Layer, Option } from "effect";
import { HttpRouter, HttpServerRequest } from "effect/unstable/http";
import { HttpApiError } from "effect/unstable/httpapi";

export const RpcSessionMiddlewareLayer = Layer.effect(
  RpcSessionMiddleware,
  Effect.gen(function* () {
    const requestContextResolver = yield* RequestContextResolver;

    return (effect, options) =>
      Effect.gen(function* () {
        const sessionContext =
          yield* requestContextResolver.resolveSessionContext({
            headers: options.headers,
          });

        return yield* Effect.provideService(
          effect,
          SessionContext,
          sessionContext
        );
      }).pipe(
        Effect.catchTags({
          "auth/InvalidSessionError": () =>
            Effect.fail(new HttpApiError.Unauthorized()),
          "identity/SessionNotFoundError": () =>
            Effect.fail(new HttpApiError.Unauthorized()),
          "identity/UserNotFoundError": () =>
            Effect.fail(new HttpApiError.Unauthorized()),
          "auth/BetterAuthError": () =>
            Effect.fail(new HttpApiError.InternalServerError()),
          RepositoryError: () =>
            Effect.fail(new HttpApiError.InternalServerError()),
        })
      );
  })
);

export const RpcWorkspaceMiddlewareLayer = Layer.effect(
  RpcWorkspaceMiddleware,
  Effect.gen(function* () {
    const requestContextResolver = yield* RequestContextResolver;

    return (effect, options) =>
      Effect.gen(function* () {
        const workspaceId = yield* WorkspaceId.makeOption(
          options.headers[WORKSPACE_ID_HEADER]
        ).pipe(
          Option.match({
            onNone: () => Effect.fail(new HttpApiError.Forbidden()),
            onSome: Effect.succeed,
          })
        );

        const sessionContext = yield* Effect.serviceOption(SessionContext).pipe(
          Effect.flatMap(
            Option.match({
              onNone: () => Effect.fail(new HttpApiError.Unauthorized()),
              onSome: Effect.succeed,
            })
          )
        );

        const workspaceContext =
          yield* requestContextResolver.resolveWorkspaceContext({
            userId: sessionContext.user.id,
            workspaceId: workspaceId,
          });

        return yield* Effect.provideService(
          effect,
          WorkspaceContext,
          workspaceContext
        );
      }).pipe(
        Effect.catchTags({
          "workspace/WorkspaceNotFoundError": () =>
            Effect.fail(new HttpApiError.Forbidden()),
          "workspace-member/WorkspaceMemberNotFoundError": () =>
            Effect.fail(new HttpApiError.Forbidden()),
          RepositoryError: () =>
            Effect.fail(new HttpApiError.InternalServerError()),
        })
      );
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

        const sessionContext =
          yield* requestContextResolver.resolveSessionContext({
            headers: request.headers,
          });

        return yield* Effect.provideService(
          effect,
          SessionContext,
          sessionContext
        );
      }).pipe(
        Effect.tapError((e) => Effect.logDebug(e)),
        Effect.catchTags({
          "auth/InvalidSessionError": () =>
            Effect.fail(new HttpApiError.Unauthorized()),
          "identity/SessionNotFoundError": () =>
            Effect.fail(new HttpApiError.Unauthorized()),
          "identity/UserNotFoundError": () =>
            Effect.fail(new HttpApiError.Unauthorized()),
          "auth/BetterAuthError": () =>
            Effect.fail(new HttpApiError.InternalServerError()),
          RepositoryError: () =>
            Effect.fail(new HttpApiError.InternalServerError()),
        })
      );
  })
);

export const HttpWorkspaceMiddleware = HttpRouter.middleware<{
  provides: WorkspaceContext;
}>()(
  Effect.gen(function* () {
    const requestContextResolver = yield* RequestContextResolver;

    return (effect) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;

        const workspaceId = yield* WorkspaceId.makeOption(
          request.headers[WORKSPACE_ID_HEADER]
        ).pipe(
          Option.match({
            onNone: () => Effect.fail(new HttpApiError.Forbidden()),
            onSome: Effect.succeed,
          })
        );

        const sessionContext = yield* Effect.serviceOption(SessionContext).pipe(
          Effect.flatMap(
            Option.match({
              onNone: () => Effect.fail(new HttpApiError.Unauthorized()),
              onSome: Effect.succeed,
            })
          )
        );

        const workspaceContext =
          yield* requestContextResolver.resolveWorkspaceContext({
            userId: sessionContext.user.id,
            workspaceId: workspaceId,
          });

        return yield* Effect.provideService(
          effect,
          WorkspaceContext,
          workspaceContext
        );
      }).pipe(
        Effect.tapError((e) => Effect.logDebug(e)),
        Effect.catchTags({
          "workspace/WorkspaceNotFoundError": () =>
            Effect.fail(new HttpApiError.Forbidden()),
          "workspace-member/WorkspaceMemberNotFoundError": () =>
            Effect.fail(new HttpApiError.Forbidden()),
          RepositoryError: () =>
            Effect.fail(new HttpApiError.InternalServerError()),
        })
      );
  })
);
