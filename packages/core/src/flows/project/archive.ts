import { AuthorizationService } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { ProjectModuleService } from "~/modules/project/project-module.service";
import { WorkspaceContext } from "~/shared/auth";
import { ProjectId } from "~/shared/schemas";

export const ArchiveProjectRequest = Schema.Struct({
  id: ProjectId,
});

export const ArchiveProjectFlow = Effect.fn("flows/ArchiveProjectFlow")(
  function* (request: typeof ArchiveProjectRequest.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* AuthorizationService;

    const projectModule = yield* ProjectModuleService;

    yield* authz.ensureAllowed({
      action: "project:archive",
      role: member.role,
    });

    yield* projectModule.archiveProject({
      id: request.id,
      workspaceId: workspace.id,
    });
  }
);
