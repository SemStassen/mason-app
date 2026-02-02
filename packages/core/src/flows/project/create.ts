import { AuthorizationService } from "@mason/authorization";
import { Effect } from "effect";
import { Project } from "~/modules/project/domain/project.model";
import { ProjectModuleService } from "~/modules/project/project-module.service";
import { WorkspaceContext } from "~/shared/auth";

export const CreateProjectRequest = Project.createInput;

export const CreateProjectFlow = Effect.fn("flows/CreateProjectFlow")(
  function* (request: typeof CreateProjectRequest.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* AuthorizationService;

    const projectModule = yield* ProjectModuleService;

    yield* authz.ensureAllowed({
      action: "project:create",
      role: member.role,
    });

    yield* projectModule.createProject({
      ...request,
      workspaceId: workspace.id,
    });
  }
);
