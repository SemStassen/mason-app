import type {
  ArchiveProjectCommand,
  ArchiveProjectResult,
} from "@mason/core/contracts";
import { ProjectModule } from "@mason/core/modules/project";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Effect } from "effect";
import { Authorization } from "#shared/authorization/index";

export const archiveProjectFlow = Effect.fn("flows.archiveProjectFlow")(
  function* (request: typeof ArchiveProjectCommand.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const projectModule = yield* ProjectModule;

    yield* authz.ensureAllowed({
      action: "project:archive",
      role: member.role,
    });

    yield* projectModule.archiveProject({
      id: request.id,
      workspaceId: workspace.id,
    });

    return undefined satisfies typeof ArchiveProjectResult.Type;
  }
);
