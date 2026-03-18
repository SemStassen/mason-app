import { Authorization } from "@mason/authorization";
import type {
  UpdateTaskCommand,
  UpdateTaskResult,
} from "@mason/core/contracts";
import { ProjectModule } from "@mason/core/modules/project";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Effect } from "effect";

export const updateTaskFlow = Effect.fn("flows.updateTaskFlow")(function* (
  request: typeof UpdateTaskCommand.Type
) {
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* Authorization;

  const projectModule = yield* ProjectModule;

  yield* authz.ensureAllowed({
    action: "project:patch_task",
    role: member.role,
  });

  const updatedTask = yield* projectModule.updateTask({
    id: request.id,
    workspaceId: workspace.id,
    data: request.data,
  });

  return updatedTask satisfies typeof UpdateTaskResult.Type;
});
