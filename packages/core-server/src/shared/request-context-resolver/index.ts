import { BetterAuth } from "@mason/auth";
import {
  SessionRepository,
  UserRepository,
} from "@mason/core/modules/identity";
import type { Session, User } from "@mason/core/modules/identity";
import { WorkspaceRepository } from "@mason/core/modules/workspace";
import { WorkspaceMemberRepository } from "@mason/core/modules/workspace-member";
import type {
  SessionContextShape,
  WorkspaceContextShape,
} from "@mason/core/shared/auth";
import { SessionId, WorkspaceId } from "@mason/core/shared/schemas";
import { Effect, Layer, Option, Schema, ServiceMap } from "effect";

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

      const resolveSessionContext = Effect.fn(
        "RequestContextResolver.resolveSessionContext"
      )(function* (params: {
        headers: Readonly<Record<string, string | undefined>>;
      }) {
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

        const sessionId = yield* Schema.decodeUnknownEffect(SessionId)(
          authSession.session.id
        ).pipe(Effect.mapError(() => new UnauthenticatedError()));

        const maybeSession = yield* sessionRepository
          .findById(sessionId)
          .pipe(
            Effect.catchTag("RepositoryError", () =>
              Effect.fail(new UnauthenticatedError())
            )
          );

        if (Option.isNone(maybeSession)) {
          return yield* new UnauthenticatedError();
        }

        const maybeUser = yield* userRepository
          .findById(maybeSession.value.userId)
          .pipe(
            Effect.catchTag("RepositoryError", () =>
              Effect.fail(new UnauthenticatedError())
            )
          );

        if (Option.isNone(maybeUser)) {
          return yield* new UnauthenticatedError();
        }

        return {
          session: maybeSession.value,
          user: maybeUser.value,
        };
      });

      const resolveWorkspaceContext = Effect.fn(
        "RequestContextResolver.resolveWorkspaceContext"
      )(function* (params: {
        sessionContext: {
          session: Session;
          user: User;
        };
      }) {
        const workspaceIdString = Option.getOrUndefined(
          params.sessionContext.session.activeWorkspaceId
        );

        if (workspaceIdString === undefined) {
          return yield* new WorkspaceAccessDeniedError();
        }

        const workspaceId = yield* Schema.decodeUnknownEffect(WorkspaceId)(
          workspaceIdString
        ).pipe(Effect.mapError(() => new WorkspaceAccessDeniedError()));

        const maybeWorkspace = yield* workspaceRepository
          .findById(workspaceId)
          .pipe(
            Effect.catchTag("RepositoryError", () =>
              Effect.fail(new WorkspaceAccessDeniedError())
            )
          );

        if (Option.isNone(maybeWorkspace)) {
          return yield* new WorkspaceAccessDeniedError();
        }

        const maybeMember = yield* workspaceMemberRepository
          .findMembership({
            workspaceId: workspaceId,
            userId: params.sessionContext.user.id,
          })
          .pipe(
            Effect.catchTag("RepositoryError", () =>
              Effect.fail(new WorkspaceAccessDeniedError())
            )
          );

        if (Option.isNone(maybeMember)) {
          return yield* new WorkspaceAccessDeniedError();
        }

        return {
          workspace: maybeWorkspace.value,
          member: maybeMember.value,
        };
      });

      return {
        resolveSessionContext,
        resolveWorkspaceContext,
      };
    })
  );
}
