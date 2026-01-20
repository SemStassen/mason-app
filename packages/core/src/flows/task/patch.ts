import { AuthorizationService } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { ProjectActionsService, Task } from "~/modules/project";
import { WorkspaceContext } from "~/shared/auth";
import { TaskId } from "~/shared/schemas";

export const PatchTaskRequest = Task.patchInput.pipe(
  Schema.extend(Schema.Struct({ id: TaskId }))
);

export const PatchTaskFlow = Effect.fn("flows/PatchTaskFlow")(function* (
  request: typeof PatchTaskRequest.Type
) {
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* AuthorizationService;

  const projectActions = yield* ProjectActionsService;

  yield* authz.ensureAllowed({
    action: "project:patch_task",
    role: member.role,
  });

  const { id, ...patch } = request;

  yield* projectActions.patchTask({
    id: request.id,
    workspaceId: workspace.id,
    patch: patch,
  });
});
