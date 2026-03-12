import { Authorization } from "@mason/authorization";
import { Effect } from "effect";
import { Project, ProjectModule } from "~/modules/project";
import { WorkspaceContext } from "~/shared/auth";

export const CreateProjectRequest = Project.jsonCreate;

export const CreateProjectResponse = Project.json;

export const CreateProjectFlow = Effect.fn("flows/CreateProjectFlow")(
	function* (request: typeof CreateProjectRequest.Type) {
		const { member, workspace } = yield* WorkspaceContext;

		const authz = yield* Authorization;

		const projectModule = yield* ProjectModule;

		yield* authz.ensureAllowed({
			action: "project:create",
			role: member.role,
		});

		const createdProject = yield* projectModule.createProject({
			workspaceId: workspace.id,
			data: request,
		});

		return createdProject satisfies typeof CreateProjectResponse.Type;
	},
);
