import type {
  RestoreTaskCommand,
  RestoreTaskResult,
} from "@recount/core/contracts";
import { ProjectModule } from "@recount/core/modules/project";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

import { Authorization } from "#shared/authorization/index";

export const restoreTaskFlow = Effect.fn("flows.restoreTaskFlow")(function* (
  request: typeof RestoreTaskCommand.Type
) {
  const { workspaceMember, workspace } = yield* WorkspaceContext;

  const authz = yield* Authorization;

  const projectModule = yield* ProjectModule;

  yield* authz.ensureAllowed({
    action: "project:restore_task",
    role: workspaceMember.role,
  });

  yield* projectModule.restoreTask({
    id: request.id,
    workspaceId: workspace.id,
  });

  return undefined satisfies typeof RestoreTaskResult.Type;
});
