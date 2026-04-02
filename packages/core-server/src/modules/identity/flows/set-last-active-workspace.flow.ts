import type {
  SetLastActiveWorkspaceCommand,
  SetLastActiveWorkspaceResult,
} from "@recount/core/contracts";
import { IdentityModule } from "@recount/core/modules/identity";
import { WorkspaceMemberModule } from "@recount/core/modules/workspace-member";
import { SessionContext } from "@recount/core/shared/auth";
import { Effect, Option } from "effect";

export const setLastActiveWorkspaceFlow = Effect.fn(
  "flows.setLastActiveWorkspaceFlow"
)(function* (params: typeof SetLastActiveWorkspaceCommand.Type) {
  const { user, session } = yield* SessionContext;

  const identityModule = yield* IdentityModule;
  const workspaceMemberModule = yield* WorkspaceMemberModule;

  yield* workspaceMemberModule.assertUserWorkspaceMember({
    workspaceId: params.id,
    userId: user.id,
  });

  yield* identityModule.setLastActiveWorkspace({
    sessionId: session.id,
    workspaceId: Option.some(params.id),
  });

  return undefined satisfies typeof SetLastActiveWorkspaceResult.Type;
});
