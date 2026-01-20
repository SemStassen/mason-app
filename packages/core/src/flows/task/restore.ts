import { AuthorizationService } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { ProjectActionsService } from "~/modules/project";
import { WorkspaceContext } from "~/shared/auth";
import { TaskId } from "~/shared/schemas";

export const RestoreTaskRequest = Schema.Struct({
  id: TaskId,
});

export const RestoreTaskFlow = Effect.fn("flows/RestoreTaskFlow")(function* (
  request: typeof RestoreTaskRequest.Type
) {
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* AuthorizationService;

  const projectActions = yield* ProjectActionsService;

  yield* authz.ensureAllowed({
    action: "project:restore_task",
    role: member.role,
  });

  yield* projectActions.restoreTask({
    id: request.id,
    workspaceId: workspace.id,
  });
});
