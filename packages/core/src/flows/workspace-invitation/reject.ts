import { Effect, Schema } from "effect";
import { WorkspaceInvitationModule } from "#modules/workspace-invitation/index";
import { SessionContext } from "#shared/auth/index";
import { WorkspaceInvitationId } from "#shared/schemas/index";

export const RejectWorkspaceInvitationRequest = Schema.Struct({
	id: WorkspaceInvitationId,
});

export const RejectWorkspaceInvitationResponse = Schema.Void;

export const RejectWorkspaceInvitationFlow = Effect.fn(
	"flows/RejectWorkspaceInvitationFlow",
)(function* (request: typeof RejectWorkspaceInvitationRequest.Type) {
	const { user } = yield* SessionContext;

	const workspaceInvitationModule = yield* WorkspaceInvitationModule;

	yield* workspaceInvitationModule.rejectWorkspaceInvitation({
		id: request.id,
		email: user.email,
	});

	return undefined satisfies typeof RejectWorkspaceInvitationResponse.Type;
});
