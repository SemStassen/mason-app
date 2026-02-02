import { AuthorizationService } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { Project, ProjectModuleService } from "~/modules/project";
import { WorkspaceContext } from "~/shared/auth";
import { ProjectId } from "~/shared/schemas";

export const PatchProjectRequest = Project.patchInput.pipe(
  Schema.extend(Schema.Struct({ id: ProjectId }))
);

export const PatchProjectFlow = Effect.fn("flows/PatchProjectFlow")(function* (
  request: typeof PatchProjectRequest.Type
) {
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* AuthorizationService;

  const projectModule = yield* ProjectModuleService;

  yield* authz.ensureAllowed({
    action: "project:patch",
    role: member.role,
  });

  const { id, ...patch } = request;

  yield* projectModule.patchProject({
    id: request.id,
    workspaceId: workspace.id,
    patch: patch,
  });
});
