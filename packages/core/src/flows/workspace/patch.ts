import { AuthorizationService } from "@mason/authorization";
import { Effect } from "effect";
import { Workspace, WorkspaceActionsService } from "~/modules/workspace";
import { WorkspaceContext } from "~/shared/auth";

export const PatchWorkspaceRequest = Workspace.patchInput;

export const PatchWorkspaceFlow = Effect.fn("flows/PatchWorkspaceFlow")(
  function* (request: typeof PatchWorkspaceRequest.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* AuthorizationService;

    const workspaceActions = yield* WorkspaceActionsService;

    yield* authz.ensureAllowed({
      action: "workspace:patch",
      role: member.role,
    });

    yield* workspaceActions.patchWorkspace({
      id: workspace.id,
      patch: request,
    });
  }
);
