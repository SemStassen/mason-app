import type {
  UpdateProjectCommand,
  UpdateProjectResult,
} from "@mason/core/contracts";
import { ProjectModule } from "@mason/core/modules/project";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Effect } from "effect";

import { Authorization } from "#shared/authorization/index";

export const updateProjectFlow = Effect.fn("flows.updateProjectFlow")(
  function* (request: typeof UpdateProjectCommand.Type) {
    const { workspaceMember, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const projectModule = yield* ProjectModule;

    yield* authz.ensureAllowed({
      action: "project:patch",
      role: workspaceMember.role,
    });

    const updatedProject = yield* projectModule.updateProject({
      id: request.id,
      workspaceId: workspace.id,
      data: request.data,
    });

    return updatedProject satisfies typeof UpdateProjectResult.Type;
  }
);
