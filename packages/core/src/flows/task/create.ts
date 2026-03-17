import { Authorization } from "@mason/authorization";
import { Effect } from "effect";
import { ProjectModule, Task } from "#modules/project/index";
import { WorkspaceContext } from "#shared/auth/index";

export const CreateTaskRequest = Task.jsonCreate;

export const CreateTaskResponse = Task.json;

export const createTaskFlow = Effect.fn("flows.createTaskFlow")(function* (
  request: typeof CreateTaskRequest.Type
) {
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* Authorization;

  const projectModule = yield* ProjectModule;

  yield* authz.ensureAllowed({
    action: "project:create_task",
    role: member.role,
  });

  const [createdTask] = yield* projectModule.createTasks({
    workspaceId: workspace.id,
    data: [request],
  });

  return createdTask satisfies typeof CreateTaskResponse.Type;
});
