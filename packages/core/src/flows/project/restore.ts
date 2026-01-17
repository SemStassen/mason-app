import { AuthorizationService } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { ProjectActionsService } from "~/modules/project";
import { WorkspaceContext } from "~/shared/auth";
import { ProjectId } from "~/shared/schemas";

export const RestoreProjectRequest = Schema.Struct({
  id: ProjectId,
});

export const RestoreProjectFlow = Effect.fn("flows/RestoreProjectFlow")(
  function* (request: typeof RestoreProjectRequest.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* AuthorizationService;

    const projectActions = yield* ProjectActionsService;

    yield* authz.ensureAllowed({
      action: "project:restore",
      role: member.role,
    });

    yield* projectActions.restoreProject({
      id: request.id,
      workspaceId: workspace.id,
    });
  }
);
