import { AuthorizationService } from "@mason/authorization";
import { Effect } from "effect";
import { Workspace } from "~/modules/workspace/domain/workspace.model";
import { WorkspaceModuleService } from "~/modules/workspace/workspace-module.service";
import { WorkspaceContext } from "~/shared/auth";

export const PatchWorkspaceRequest = Workspace.patchInput;

export const PatchWorkspaceFlow = Effect.fn("flows/PatchWorkspaceFlow")(
  function* (request: typeof PatchWorkspaceRequest.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* AuthorizationService;

    const workspaceModule = yield* WorkspaceModuleService;

    yield* authz.ensureAllowed({
      action: "workspace:patch",
      role: member.role,
    });

    yield* workspaceModule.patchWorkspace({
      id: workspace.id,
      patch: request,
    });
  }
);
