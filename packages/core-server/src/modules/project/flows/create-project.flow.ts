import type {
  CreateProjectCommand,
  CreateProjectResult,
} from "@recount/core/contracts";
import { ProjectModule } from "@recount/core/modules/project";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

import { Authorization } from "#shared/authorization/index";

export const createProjectFlow = Effect.fn("flows.createProjectFlow")(
  function* (request: typeof CreateProjectCommand.Type) {
    const { workspaceMember, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const projectModule = yield* ProjectModule;

    yield* authz.ensureAllowed({
      action: "project:create",
      role: workspaceMember.role,
    });

    const [createdProject] = yield* projectModule.createProjects({
      workspaceId: workspace.id,
      data: [request],
    });

    return createdProject satisfies typeof CreateProjectResult.Type;
  }
);
