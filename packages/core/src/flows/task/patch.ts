import { AuthorizationService } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { Task } from "~/modules/project/domain/task.model";
import { ProjectModuleService } from "~/modules/project/project-module.service";
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

  const projectModule = yield* ProjectModuleService;

  yield* authz.ensureAllowed({
    action: "project:patch_task",
    role: member.role,
  });

  const { id, ...patch } = request;

  yield* projectModule.patchTask({
    id: request.id,
    workspaceId: workspace.id,
    patch: patch,
  });
});
