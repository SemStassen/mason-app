import type {
  UpdateWorkspaceCommand,
  UpdateWorkspaceResult,
} from "@mason/core/contracts";
import { WorkspaceModule } from "@mason/core/modules/workspace";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Effect } from "effect";

import { Authorization } from "#shared/authorization/index";

export const updateWorkspaceFlow = Effect.fn("flows.updateWorkspaceFlow")(
  function* (request: typeof UpdateWorkspaceCommand.Type) {
    const { workspaceMember, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const workspaceModule = yield* WorkspaceModule;

    yield* authz.ensureAllowed({
      action: "workspace:patch",
      role: workspaceMember.role,
    });

    const updatedWorkspace = yield* workspaceModule.updateWorkspace({
      id: workspace.id,
      data: request,
    });

    return updatedWorkspace satisfies typeof UpdateWorkspaceResult.Type;
  }
);
