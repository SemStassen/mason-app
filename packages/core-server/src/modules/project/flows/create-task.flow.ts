import type {
  CreateTaskCommand,
  CreateTaskResult,
} from "@mason/core/contracts";
import { ProjectModule } from "@mason/core/modules/project";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Effect } from "effect";
import { Authorization } from "#shared/authorization/index";

export const createTaskFlow = Effect.fn("flows.createTaskFlow")(function* (
  request: typeof CreateTaskCommand.Type
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

  return createdTask satisfies typeof CreateTaskResult.Type;
});
