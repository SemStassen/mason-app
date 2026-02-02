import { AuthorizationService } from "@mason/authorization";
import { Effect } from "effect";
import { ProjectModuleService, Task } from "~/modules/project";
import { WorkspaceContext } from "~/shared/auth";

export const CreateTaskRequest = Task.createInput;

export const CreateTaskFlow = Effect.fn("flows/CreateTaskFlow")(function* (
  request: typeof CreateTaskRequest.Type
) {
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* AuthorizationService;

  const projectModule = yield* ProjectModuleService;

  yield* authz.ensureAllowed({
    action: "project:create_task",
    role: member.role,
  });

  yield* projectModule.createTask({
    ...request,
    workspaceId: workspace.id,
  });
});
