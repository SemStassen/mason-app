import type {
  SetActiveWorkspaceCommand,
  SetActiveWorkspaceResult,
} from "@mason/core/contracts";
import { IdentityModule } from "@mason/core/modules/identity";
import { WorkspaceMemberModule } from "@mason/core/modules/workspace-member";
import { SessionContext } from "@mason/core/shared/auth";
import { Effect, Option } from "effect";

export const setActiveWorkspaceFlow = Effect.fn("flows.setActiveWorkspaceFlow")(
  function* (params: typeof SetActiveWorkspaceCommand.Type) {
    const { user, session } = yield* SessionContext;

    const identityModule = yield* IdentityModule;
    const workspaceMemberModule = yield* WorkspaceMemberModule;

    yield* workspaceMemberModule.assertUserWorkspaceMember({
      workspaceId: params.id,
      userId: user.id,
    });

    yield* identityModule.setActiveWorkspace({
      sessionId: session.id,
      workspaceId: Option.some(params.id),
    });

    return undefined satisfies typeof SetActiveWorkspaceResult.Type;
  }
);
