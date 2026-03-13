import { Authorization } from "@mason/authorization";
import { Effect, Schema } from "effect";
import {
	WorkspaceInvitation,
	WorkspaceInvitationModule,
} from "#modules/workspace-invitation/index";
import { WorkspaceContext } from "#shared/auth/index";

export const CancelWorkspaceInvitationRequest = Schema.Struct({
	id: WorkspaceInvitation.fields.id,
});

export const CancelWorkspaceInvitationResponse = Schema.Void;

export const CancelWorkspaceInvitationFlow = Effect.fn(
	"flows/CancelWorkspaceInvitationFlow",
)(function* (request: typeof CancelWorkspaceInvitationRequest.Type) {
	const { member, workspace } = yield* WorkspaceContext;

	const authz = yield* Authorization;

	const workspaceInvitationModule = yield* WorkspaceInvitationModule;

	yield* authz.ensureAllowed({
		action: "workspace:cancel_invite",
		role: member.role,
	});

	yield* workspaceInvitationModule.cancelWorkspaceInvitation({
		id: request.id,
		workspaceId: workspace.id,
	});

	return undefined satisfies typeof CancelWorkspaceInvitationResponse.Type;
});
