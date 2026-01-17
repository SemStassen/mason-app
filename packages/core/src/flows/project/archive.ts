import { AuthorizationService } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { ProjectActionsService } from "~/modules/project";
import { WorkspaceContext } from "~/shared/auth";
import { ProjectId } from "~/shared/schemas";

export const ArchiveProjectRequest = Schema.Struct({
  id: ProjectId,
});

export const ArchiveProjectFlow = Effect.fn("flows/ArchiveProjectFlow")(
  function* (request: typeof ArchiveProjectRequest.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* AuthorizationService;

    const projectActions = yield* ProjectActionsService;

    yield* authz.ensureAllowed({
      action: "project:archive",
      role: member.role,
    });

    yield* projectActions.archiveProject({
      id: request.id,
      workspaceId: workspace.id,
    });
  }
);
