import { Effect, Option, Schema } from "effect";
import { IdentityModule } from "~/modules/identity/identity.service";
import { Workspace } from "~/modules/workspace/domain/workspace.entity";
import { WorkspaceMemberModule } from "~/modules/workspace-member/workspace-member.service";
import { SessionContext } from "~/shared/auth";

export const SetActiveWorkspaceRequest = Schema.Struct({
	id: Workspace.fields.id,
});

export const SetActiveWorkspaceResponse = Schema.Void;

export const SetActiveWorkspaceFlow = Effect.fn("flows/SetActiveWorkspaceFlow")(
	function* (request: typeof SetActiveWorkspaceRequest.Type) {
		const { user, session } = yield* SessionContext;

		const memberModule = yield* WorkspaceMemberModule;
		const identityModule = yield* IdentityModule;

		yield* memberModule.assertUserWorkspaceMember({
			workspaceId: request.id,
			userId: user.id,
		});

		yield* identityModule.setActiveWorkspace({
			sessionId: session.id,
			workspaceId: Option.some(request.id),
		});

		return undefined satisfies typeof SetActiveWorkspaceResponse.Type;
	},
);
