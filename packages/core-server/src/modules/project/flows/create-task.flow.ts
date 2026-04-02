import type {
  CreateTaskCommand,
  CreateTaskResult,
} from "@recount/core/contracts";
import { ProjectModule } from "@recount/core/modules/project";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

import { Authorization } from "#shared/authorization/index";

export const createTaskFlow = Effect.fn("flows.createTaskFlow")(function* (
  request: typeof CreateTaskCommand.Type
) {
  const { workspaceMember, workspace } = yield* WorkspaceContext;

  const authz = yield* Authorization;

  const projectModule = yield* ProjectModule;

  yield* authz.ensureAllowed({
    action: "project:create_task",
    role: workspaceMember.role,
  });

  const [createdTask] = yield* projectModule.createTasks({
    workspaceId: workspace.id,
    data: [request],
  });

  return createdTask satisfies typeof CreateTaskResult.Type;
});
