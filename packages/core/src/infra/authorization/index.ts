import { Context, type Effect, Schema } from "effect";
import type { UserId, WorkspaceId } from "~/shared/schemas";

export class AuthorizationError extends Schema.TaggedError<AuthorizationError>()(
  "shared/AuthorizationError",
  {
    cause: Schema.Unknown,
  }
) {}

export class AuthorizationService extends Context.Tag(
  "@mason/application/AuthorizationService"
)<
  AuthorizationService,
  {
    ensureUserMatches: (params: {
      userId: UserId;
      model: ReadonlyArray<{ userId: UserId }>;
    }) => Effect.Effect<void, AuthorizationError>;
    ensureWorkspaceMatches: (params: {
      workspaceId: WorkspaceId;
      model: ReadonlyArray<{ workspaceId: WorkspaceId }>;
    }) => Effect.Effect<void, AuthorizationError>;
  }
>() {}
