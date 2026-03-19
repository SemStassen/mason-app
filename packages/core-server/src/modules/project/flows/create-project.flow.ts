import type {
  CreateProjectCommand,
  CreateProjectResult,
} from "@mason/core/contracts";
import { ProjectModule } from "@mason/core/modules/project";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Effect } from "effect";
import { Authorization } from "#shared/authorization/index";

export const createProjectFlow = Effect.fn("flows.createProjectFlow")(
  function* (request: typeof CreateProjectCommand.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const projectModule = yield* ProjectModule;

    yield* authz.ensureAllowed({
      action: "project:create",
      role: member.role,
    });

    const [createdProject] = yield* projectModule.createProjects({
      workspaceId: workspace.id,
      data: [request],
    });

    return createdProject satisfies typeof CreateProjectResult.Type;
  }
);
