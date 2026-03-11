import { AuthorizationService } from "@mason/authorization";
import { Effect } from "effect";
import { Workspace } from "~/modules/workspace/domain/workspace.entity";
import { WorkspaceModule } from "~/modules/workspace/workspace.service";
import { WorkspaceContext } from "~/shared/auth";

export const UpdateWorkspaceRequest = Workspace.jsonUpdate;

export const UpdateWorkspaceResponse = Workspace.json;

export const UpdateWorkspaceFlow = Effect.fn("flows/UpdateWorkspaceFlow")(
	function* (request: typeof UpdateWorkspaceRequest.Type) {
		const { member, workspace } = yield* WorkspaceContext;

		const authz = yield* AuthorizationService;

		const workspaceModule = yield* WorkspaceModule;

		yield* authz.ensureAllowed({
			action: "workspace:patch",
			role: member.role,
		});

		const updatedWorkspace = yield* workspaceModule.updateWorkspace({
			id: workspace.id,
			data: request,
		});

		return updatedWorkspace satisfies typeof UpdateWorkspaceResponse.Type;
	},
);
