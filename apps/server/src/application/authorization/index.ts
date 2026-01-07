import { Context, type Effect } from "effect";
import type { AuthorizationError } from "~/shared/errors/authorization";
import type { UserId, WorkspaceId } from "~/shared/schemas";

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
