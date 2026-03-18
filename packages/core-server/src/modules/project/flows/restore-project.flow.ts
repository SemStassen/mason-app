import { Authorization } from "@mason/authorization";
import type {
  RestoreProjectCommand,
  RestoreProjectResult,
} from "@mason/core/contracts";
import { ProjectModule } from "@mason/core/modules/project";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Effect } from "effect";

export const restoreProjectFlow = Effect.fn("flows.restoreProjectFlow")(
  function* (request: typeof RestoreProjectCommand.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const projectModule = yield* ProjectModule;

    yield* authz.ensureAllowed({
      action: "project:restore",
      role: member.role,
    });

    yield* projectModule.restoreProject({
      id: request.id,
      workspaceId: workspace.id,
    });

    return undefined satisfies typeof RestoreProjectResult.Type;
  }
);
