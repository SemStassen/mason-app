import { AuthorizationService } from "@mason/authorization";
import { Effect } from "effect";
import { ProjectActionsService, Task } from "~/modules/project";
import { WorkspaceContext } from "~/shared/auth";

export const CreateTaskRequest = Task.createInput;

export const CreateTaskFlow = Effect.fn("flows/CreateTaskFlow")(function* (
  request: typeof CreateTaskRequest.Type
) {
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
});
