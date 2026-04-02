import type {
  RestoreProjectCommand,
  RestoreProjectResult,
} from "@recount/core/contracts";
import { ProjectModule } from "@recount/core/modules/project";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

import { Authorization } from "#shared/authorization/index";

export const restoreProjectFlow = Effect.fn("flows.restoreProjectFlow")(
  function* (request: typeof RestoreProjectCommand.Type) {
    const { workspaceMember, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const projectModule = yield* ProjectModule;

    yield* authz.ensureAllowed({
      action: "project:restore",
      role: workspaceMember.role,
    });

    yield* projectModule.restoreProject({
      id: request.id,
      workspaceId: workspace.id,
    });

    return undefined satisfies typeof RestoreProjectResult.Type;
  }
);
