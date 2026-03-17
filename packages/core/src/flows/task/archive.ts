import { Authorization } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { ProjectModule } from "#modules/project/index";
import { WorkspaceContext } from "#shared/auth/index";
import { TaskId } from "#shared/schemas/index";

export const ArchiveTaskRequest = Schema.Struct({
  id: TaskId,
});

export const ArchiveTaskResponse = Schema.Void;

export const archiveTaskFlow = Effect.fn("flows.archiveTaskFlow")(function* (
  request: typeof ArchiveTaskRequest.Type
) {
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* Authorization;

  const projectModule = yield* ProjectModule;

  yield* authz.ensureAllowed({
    action: "project:archive_task",
    role: member.role,
  });

  yield* projectModule.archiveTask({
    id: request.id,
    workspaceId: workspace.id,
  });

  return undefined satisfies typeof ArchiveTaskResponse.Type;
});
