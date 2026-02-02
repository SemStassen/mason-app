import { Effect, Option, Schema } from "effect";
import { IdentityModuleService } from "~/modules/identity";
import { MemberModuleService } from "~/modules/member";
import { SessionContext } from "~/shared/auth";
import { WorkspaceId } from "~/shared/schemas";

export const SetActiveWorkspaceRequest = Schema.Struct({
  id: WorkspaceId,
});

export const SetActiveWorkspaceFlow = Effect.fn("flows/SetActiveWorkspaceFlow")(
  function* (request: typeof SetActiveWorkspaceRequest.Type) {
    const { user, session } = yield* SessionContext;

    const memberModule = yield* MemberModuleService;
    const identityModule = yield* IdentityModuleService;

    yield* memberModule.assertUserWorkspaceMember({
      workspaceId: request.id,
      userId: user.id,
    });

    yield* identityModule.setActiveWorkspace({
      sessionId: session.id,
      workspaceId: Option.some(request.id),
    });
  }
);
