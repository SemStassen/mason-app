import {
  SessionNotFoundError,
  SessionRepository,
  UserNotFoundError,
  UserRepository,
} from "@mason/core/modules/identity";
import {
  WorkspaceRepository,
  WorkspaceNotFoundError,
} from "@mason/core/modules/workspace";
import {
  WorkspaceMemberRepository,
  WorkspaceMemberNotFoundError,
} from "@mason/core/modules/workspace-member";
import type {
  SessionContextShape,
  WorkspaceContextShape,
} from "@mason/core/shared/auth";
import type { RepositoryError } from "@mason/core/shared/repository";
import type { WorkspaceId } from "@mason/core/shared/schemas";
import { SessionId, UserId } from "@mason/core/shared/schemas";
import { Effect, Layer, Schema, ServiceMap, Option } from "effect";

import type { BetterAuthError } from "./better-auth";
import { BetterAuth } from "./better-auth";

export class InvalidSessionError extends Schema.TaggedErrorClass<InvalidSessionError>()(
  "auth/InvalidSessionError",
  {}
) {}

export class RequestContextResolver extends ServiceMap.Service<
  RequestContextResolver,
  {
    resolveSessionContext: (params: {
      headers: Readonly<Record<string, string | undefined>>;
    }) => Effect.Effect<
      SessionContextShape,
      | InvalidSessionError
      | BetterAuthError
      | SessionNotFoundError
      | UserNotFoundError
      | RepositoryError
    >;
    resolveWorkspaceContext: (params: {
      userId: UserId;
      workspaceId: WorkspaceId;
    }) => Effect.Effect<
      WorkspaceContextShape,
      WorkspaceNotFoundError | WorkspaceMemberNotFoundError | RepositoryError
    >;
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

          const authSession = yield* betterAuth.use((client) =>
            client.api.getSession({ headers })
          );

          if (authSession === null) {
            return yield* new InvalidSessionError();
          }

          const [sessionId, userId] = yield* Effect.all(
            [
              Schema.decodeUnknownEffect(SessionId)(authSession.session.id),
              Schema.decodeUnknownEffect(UserId)(authSession.user.id),
            ],
            { concurrency: "unbounded" }
          ).pipe(Effect.mapError(() => new InvalidSessionError()));

          const { session, user } = yield* Effect.all(
            {
              maybeSession: sessionRepository.findById(sessionId),
              maybeUser: userRepository.findById(userId),
            },
            { concurrency: "unbounded" }
          ).pipe(
            Effect.flatMap(({ maybeSession, maybeUser }) =>
              Effect.all({
                session: Option.match(maybeSession, {
                  onNone: () =>
                    Effect.fail(
                      new SessionNotFoundError({
                        sessionId: sessionId,
                      })
                    ),
                  onSome: Effect.succeed,
                }),
                user: Option.match(maybeUser, {
                  onNone: () =>
                    Effect.fail(
                      new UserNotFoundError({
                        userId: userId,
                      })
                    ),
                  onSome: Effect.succeed,
                }),
              })
            )
          );

          return {
            session,
            user,
          };
        }),
        /**
         * Resolves workspace context for a given user and workspace.
         *
         * Verifies that the workspace exists and that the user is an active member,
         * ensuring a user can only access workspaces they belong to.
         */
        resolveWorkspaceContext: Effect.fn(
          "RequestContextResolver.resolveWorkspaceContext"
        )(function* (params) {
          // Queries run in parallel for performance, but option checks are sequential
          // so WorkspaceNotFoundError always surfaces before WorkspaceMemberNotFoundError
          const { maybeWorkspace, maybeWorkspaceMember } = yield* Effect.all(
            {
              maybeWorkspace: workspaceRepository.findById(params.workspaceId),
              maybeWorkspaceMember: workspaceMemberRepository.findMembership({
                workspaceId: params.workspaceId,
                userId: params.userId,
              }),
            },
            { concurrency: "unbounded" }
          );

          const workspace = yield* Option.match(maybeWorkspace, {
            onNone: () =>
              Effect.fail(
                new WorkspaceNotFoundError({ workspaceId: params.workspaceId })
              ),
            onSome: Effect.succeed,
          });

          const workspaceMember = yield* Option.match(maybeWorkspaceMember, {
            onNone: () =>
              Effect.fail(
                new WorkspaceMemberNotFoundError({
                  lookup: {
                    workspaceId: params.workspaceId,
                    userId: params.userId,
                  },
                })
              ),
            onSome: Effect.succeed,
          });

          return {
            workspace,
            workspaceMember,
          };
        }),
      };
    })
  );
}
