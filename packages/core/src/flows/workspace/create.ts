import { Effect, Option } from "effect";
import { IdentityModule } from "#modules/identity/index";
import { Workspace, WorkspaceModule } from "#modules/workspace/index";
import { WorkspaceMemberModule } from "#modules/workspace-member/index";
import { SessionContext } from "#shared/auth/index";
import { Database } from "#shared/database/index";

export const CreateWorkspaceRequest = Workspace.jsonCreate;

export const CreateWorkspaceResponse = Workspace.json;

export const CreateWorkspaceFlow = Effect.fn("flows/CreateWorkspaceFlow")(
	function* (request: typeof CreateWorkspaceRequest.Type) {
		const { user, session } = yield* SessionContext;

		const db = yield* Database;

		const workspaceModule = yield* WorkspaceModule;
		const workspaceMemberModule = yield* WorkspaceMemberModule;
		const identityModule = yield* IdentityModule;

		const createdWorkspace = yield* db.withTransaction(
			Effect.gen(function* () {
				const workspace = yield* workspaceModule.createWorkspace(request);

				yield* workspaceMemberModule.createWorkspaceMember({
					workspaceId: workspace.id,
					userId: user.id,
					role: "owner",
				});

				yield* identityModule.setActiveWorkspace({
					workspaceId: Option.some(workspace.id),
					sessionId: session.id,
				});

				return workspace;
			}),
		);

		return createdWorkspace satisfies typeof CreateWorkspaceResponse.Type;
	},
);
