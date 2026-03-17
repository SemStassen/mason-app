import { Authorization } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { Project, ProjectModule } from "#modules/project/index";
import { WorkspaceContext } from "#shared/auth/index";
import { ProjectId } from "#shared/schemas/index";

export const UpdateProjectRequest = Schema.Struct({
  id: ProjectId,
  data: Project.jsonUpdate,
});

export const UpdateProjectResponse = Project.json;

export const updateProjectFlow = Effect.fn("flows.updateProjectFlow")(
  function* (request: typeof UpdateProjectRequest.Type) {
    const { member, workspace } = yield* WorkspaceContext;

    const authz = yield* Authorization;

    const projectModule = yield* ProjectModule;

    yield* authz.ensureAllowed({
      action: "project:patch",
      role: member.role,
    });

    const updatedProject = yield* projectModule.updateProject({
      id: request.id,
      workspaceId: workspace.id,
      data: request.data,
    });

    return updatedProject satisfies typeof UpdateProjectResponse.Type;
  }
);
