import type {
  ArchiveProjectCommand,
  ArchiveProjectResult,
} from "@recount/core/contracts";
import { ProjectModule } from "@recount/core/modules/project";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

import { Authorization } from "#shared/authorization/index";

export const archiveProjectFlow = Effect.fn("flows.archiveProjectFlow")(
  function* (request: typeof ArchiveProjectCommand.Type) {
    const { workspaceMember, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const projectModule = yield* ProjectModule;

    yield* authz.ensureAllowed({
      action: "project:archive",
      role: workspaceMember.role,
    });

    yield* projectModule.archiveProject({
      id: request.id,
      workspaceId: workspace.id,
    });

    return undefined satisfies typeof ArchiveProjectResult.Type;
  }
);
