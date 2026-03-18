import { Authorization } from "@mason/authorization";
import type {
  RestoreTaskCommand,
  RestoreTaskResult,
} from "@mason/core/contracts";
import { ProjectModule } from "@mason/core/modules/project";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Effect } from "effect";

export const restoreTaskFlow = Effect.fn("flows.restoreTaskFlow")(function* (
  request: typeof RestoreTaskCommand.Type
) {
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* Authorization;

  const projectModule = yield* ProjectModule;

  yield* authz.ensureAllowed({
    action: "project:restore_task",
    role: member.role,
  });

  yield* projectModule.restoreTask({
    id: request.id,
    workspaceId: workspace.id,
  });

  return undefined satisfies typeof RestoreTaskResult.Type;
});
