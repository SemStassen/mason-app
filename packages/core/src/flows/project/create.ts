import { AuthorizationService } from "@mason/authorization";
import { Effect } from "effect";
import { ProjectActionsService } from "~/modules/project";
import { CreateProject } from "~/modules/project/domain";
import { WorkspaceContext } from "~/shared/auth";

export const CreateProjectRequest = CreateProject.omit("workspaceId");

export const CreateProjectFlow = Effect.fn("flows/CreateProjectFlow")(
  function* (request: typeof CreateProjectRequest.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* AuthorizationService;

    const projectActions = yield* ProjectActionsService;

    yield* authz.ensureAllowed({
      action: "project:create",
      role: member.role,
    });

    yield* projectActions.createProject({
      ...request,
      workspaceId: workspace.id,
    });
  }
);
