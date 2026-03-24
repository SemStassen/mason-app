import {
  SessionRepository,
  UserRepository,
} from "@mason/core/modules/identity";
import { WorkspaceRepository } from "@mason/core/modules/workspace";
import { WorkspaceMemberRepository } from "@mason/core/modules/workspace-member";
import type {
  SessionContextShape,
  WorkspaceContextShape,
} from "@mason/core/shared/auth";
import { SessionId, UserId } from "@mason/core/shared/schemas";
import { Effect, Layer, Schema, ServiceMap, Option } from "effect";

import { BetterAuth } from "./better-auth";

export class UnauthenticatedError extends Schema.TaggedErrorClass<UnauthenticatedError>()(
  "auth/UnauthenticatedError",
  {}
) {}

export class WorkspaceAccessDeniedError extends Schema.TaggedErrorClass<WorkspaceAccessDeniedError>()(
  "auth/WorkspaceAccessDeniedError",
  {}
) {}

export class RequestContextResolver extends ServiceMap.Service<
  RequestContextResolver,
  {
    resolveSessionContext: (params: {
      headers: Readonly<Record<string, string | undefined>>;
    }) => Effect.Effect<SessionContextShape, UnauthenticatedError>;
    resolveWorkspaceContext: (params: {
      sessionContext: SessionContextShape;
    }) => Effect.Effect<WorkspaceContextShape, WorkspaceAccessDeniedError>;
  }
>()("@mason/auth/RequestContextResolver") {
  static readonly layer = Layer.effect(
    RequestContextResolver,
    Effect.gen(function* () {
      const betterAuth = yield* BetterAuth;
      const sessionRepository = yield* SessionRepository;
      const userRepository = yield* UserRepository;
      const workspaceRepository = yield* WorkspaceRepository;
      const workspaceMemberRepository = yield* WorkspaceMemberRepository;

      return {
        resolveSessionContext: Effect.fn(
          "RequestContextResolver.resolveSessionContext"
        )(function* (params) {
          const headers = new Headers();
          for (const [key, value] of Object.entries(params.headers)) {
            if (value !== undefined) {
              headers.set(key, value);
            }
          }

          const authSession = yield* betterAuth
            .use((client) => client.api.getSession({ headers }))
            .pipe(Effect.mapError(() => new UnauthenticatedError()));

          if (authSession === null) {
            return yield* new UnauthenticatedError();
          }

          const [sessionId, userId] = yield* Effect.all(
            [
              Schema.decodeUnknownEffect(SessionId)(authSession.session.id),
              Schema.decodeUnknownEffect(UserId)(authSession.user.id),
            ],
            { concurrency: "unbounded" }
          ).pipe(Effect.mapError(() => new UnauthenticatedError()));

          const [maybeSession, maybeUser] = yield* Effect.all(
            [
              sessionRepository.findById(sessionId),
              userRepository.findById(userId),
            ],
            { concurrency: "unbounded" }
          ).pipe(
            Effect.catchTag("RepositoryError", () =>
              Effect.fail(new UnauthenticatedError())
            )
          );

          if (Option.isNone(maybeSession) || Option.isNone(maybeUser)) {
            return yield* new UnauthenticatedError();
          }

          return {
            session: maybeSession.value,
            user: maybeUser.value,
          };
        }),
        resolveWorkspaceContext: Effect.fn(
          "RequestContextResolver.resolveWorkspaceContext"
        )(function* (params) {
          const workspaceId = yield* Option.match(
            params.sessionContext.session.activeWorkspaceId,
            {
              onNone: () => Effect.fail(new WorkspaceAccessDeniedError()),
              onSome: Effect.succeed,
            }
          );

          const [maybeWorkspace, maybeMember] = yield* Effect.all(
            [
              workspaceRepository.findById(workspaceId),
              workspaceMemberRepository.findMembership({
                workspaceId,
                userId: params.sessionContext.user.id,
              }),
            ],
            { concurrency: "unbounded" }
          ).pipe(
            Effect.catchTag("RepositoryError", () =>
              Effect.fail(new WorkspaceAccessDeniedError())
            )
          );

          if (Option.isNone(maybeWorkspace) || Option.isNone(maybeMember)) {
            return yield* new WorkspaceAccessDeniedError();
          }

          return {
            workspace: maybeWorkspace.value,
            member: maybeMember.value,
          };
        }),
      };
    })
  );
}
