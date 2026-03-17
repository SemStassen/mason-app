import { Authorization } from "@mason/authorization";
import { Effect } from "effect";
import { Workspace, WorkspaceModule } from "#modules/workspace/index";
import { WorkspaceContext } from "#shared/auth/index";

export const UpdateWorkspaceRequest = Workspace.jsonUpdate;

export const UpdateWorkspaceResponse = Workspace.json;

export const updateWorkspaceFlow = Effect.fn("flows.updateWorkspaceFlow")(
  function* (request: typeof UpdateWorkspaceRequest.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const workspaceModule = yield* WorkspaceModule;

    yield* authz.ensureAllowed({
      action: "workspace:patch",
      role: member.role,
    });

    const updatedWorkspace = yield* workspaceModule.updateWorkspace({
      id: workspace.id,
      data: request,
    });

    return updatedWorkspace satisfies typeof UpdateWorkspaceResponse.Type;
  }
);
