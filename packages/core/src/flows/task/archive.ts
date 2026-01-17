import { AuthorizationService } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { ProjectActionsService } from "~/modules/project";
import { WorkspaceContext } from "~/shared/auth";
import {  TaskId } from "~/shared/schemas";

export const ArchiveTaskRequest = Schema.Struct({
  id: TaskId,
});

export const ArchiveTaskFlow = Effect.fn("flows/ArchiveTaskFlow")(
  function* (request: typeof ArchiveTaskRequest.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* AuthorizationService;

    const projectActions = yield* ProjectActionsService;

    yield* authz.ensureAllowed({
      action: "project:archive_task",
      role: member.role,
    });

    yield* projectActions.archiveTask({
      id: request.id,
      workspaceId: workspace.id,
    });
  }
);
