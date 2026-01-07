import { Context, type Effect } from "effect";
import type { AuthorizationError } from "~/shared/errors/authorization";
import type { WorkspaceId } from "~/shared/schemas";

export class AuthorizationService extends Context.Tag(
  "@mason/application/AuthorizationService"
)<
  AuthorizationService,
  {
    ensureWorkspaceMatches: (params: {
      workspaceId: WorkspaceId;
      model: ReadonlyArray<{ workspaceId: WorkspaceId }>;
    }) => Effect.Effect<void, AuthorizationError>;
  }
>() {}
