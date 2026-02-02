import { AuthorizationService } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { ProjectModuleService } from "~/modules/project/project-module.service";
import { WorkspaceContext } from "~/shared/auth";
import { ProjectId } from "~/shared/schemas";

export const RestoreProjectRequest = Schema.Struct({
  id: ProjectId,
});

export const RestoreProjectFlow = Effect.fn("flows/RestoreProjectFlow")(
  function* (request: typeof RestoreProjectRequest.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* AuthorizationService;

    const projectModule = yield* ProjectModuleService;

    yield* authz.ensureAllowed({
      action: "project:restore",
      role: member.role,
    });

    yield* projectModule.restoreProject({
      id: request.id,
      workspaceId: workspace.id,
    });
  }
);
