import type {
  ArchiveTaskCommand,
  ArchiveTaskResult,
} from "@mason/core/contracts";
import { ProjectModule } from "@mason/core/modules/project";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Effect } from "effect";

import { Authorization } from "#shared/authorization/index";

export const archiveTaskFlow = Effect.fn("flows.archiveTaskFlow")(function* (
  request: typeof ArchiveTaskCommand.Type
) {
  const { workspaceMember, workspace } = yield* WorkspaceContext;

  const authz = yield* Authorization;

  const projectModule = yield* ProjectModule;

  yield* authz.ensureAllowed({
    action: "project:archive_task",
    role: workspaceMember.role,
  });

  yield* projectModule.archiveTask({
    id: request.id,
    workspaceId: workspace.id,
  });

  return undefined satisfies typeof ArchiveTaskResult.Type;
});
