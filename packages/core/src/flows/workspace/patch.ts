import { AuthorizationService } from "@mason/authorization";
import { Effect } from "effect";
import { Workspace } from "~/modules/workspace/domain/workspace.entity";
import { WorkspaceModuleService } from "~/modules/workspace/workspace.layer";
import { WorkspaceContext } from "~/shared/auth";

export const PatchWorkspaceRequest = Workspace.flowPatch;

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
