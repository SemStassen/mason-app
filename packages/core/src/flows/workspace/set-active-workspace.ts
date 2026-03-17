import { Effect, Option, Schema } from "effect";
import { IdentityModule } from "#modules/identity/index";
import { Workspace } from "#modules/workspace/index";
import { WorkspaceMemberModule } from "#modules/workspace-member/index";
import { SessionContext } from "#shared/auth/index";

export const SetActiveWorkspaceRequest = Schema.Struct({
  id: Workspace.fields.id,
});

export const SetActiveWorkspaceResponse = Schema.Void;

export const setActiveWorkspaceFlow = Effect.fn("flows.setActiveWorkspaceFlow")(
  function* (request: typeof SetActiveWorkspaceRequest.Type) {
    const { user, session } = yield* SessionContext;

    const memberModule = yield* WorkspaceMemberModule;
    const identityModule = yield* IdentityModule;

    yield* memberModule.assertUserWorkspaceMember({
      workspaceId: request.id,
      userId: user.id,
    });

    yield* identityModule.setActiveWorkspace({
      sessionId: session.id,
      workspaceId: Option.some(request.id),
    });

    return undefined satisfies typeof SetActiveWorkspaceResponse.Type;
  }
);
