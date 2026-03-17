import { Authorization } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { ProjectModule } from "#modules/project/index";
import { WorkspaceContext } from "#shared/auth/index";
import { TaskId } from "#shared/schemas/index";

export const RestoreTaskRequest = Schema.Struct({
  id: TaskId,
});

export const RestoreTaskResponse = Schema.Void;

export const restoreTaskFlow = Effect.fn("flows.restoreTaskFlow")(function* (
  request: typeof RestoreTaskRequest.Type
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
});
