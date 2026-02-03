import { AuthorizationService } from "@mason/authorization";
import { Effect } from "effect";
import { Task } from "~/modules/project/domain/task.model";
import { ProjectModuleService } from "~/modules/project/project-module.service";
import { WorkspaceContext } from "~/shared/auth";

export const CreateTaskRequest = Task.flowCreate;

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
