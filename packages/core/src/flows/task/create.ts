import { AuthorizationService } from "@mason/authorization";
import { Effect } from "effect";
import { CreateTask, ProjectActionsService } from "~/modules/project";
import { WorkspaceContext } from "~/shared/auth";

export const CreateTaskRequest = CreateTask.omit("workspaceId");

export const CreateTaskFlow = Effect.fn("flows/CreateTaskFlow")(
  function* (request: typeof CreateTaskRequest.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* AuthorizationService;

    const projectActions = yield* ProjectActionsService;

    yield* authz.ensureAllowed({
      action: "project:create_task",
      role: member.role,
    });

    yield* projectActions.createTask({
      ...request,
      workspaceId: workspace.id,
    });
  }
);
