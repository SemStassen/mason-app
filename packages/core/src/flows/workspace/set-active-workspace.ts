import { Effect, Option, Schema } from "effect";
import { IdentityActionsService } from "~/modules/identity";
import { MemberActionsService } from "~/modules/member";
import { SessionContext } from "~/shared/auth";
import { WorkspaceId } from "~/shared/schemas";

export const SetActiveWorkspaceRequest = Schema.Struct({
  id: WorkspaceId,
});

export const SetActiveWorkspaceFlow = Effect.fn("flows/SetActiveWorkspaceFlow")(
  function* (request: typeof SetActiveWorkspaceRequest.Type) {
    const { user, session } = yield* SessionContext;

    const memberActions = yield* MemberActionsService;
    const identityActions = yield* IdentityActionsService;

    yield* memberActions.assertUserWorkspaceMember({
      workspaceId: request.id,
      userId: user.id,
    });

    yield* identityActions.setActiveWorkspace({
      sessionId: session.id,
      workspaceId: Option.some(request.id),
    });
  }
);
