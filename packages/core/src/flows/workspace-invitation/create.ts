import { Authorization } from "@mason/authorization";
import { Effect, Option } from "effect";
import { IdentityModule } from "~/modules/identity/identity.service";
import { WorkspaceInvitation } from "~/modules/workspace-invitation/domain/workspace-invitation.entity";
import { WorkspaceInvitationModule } from "~/modules/workspace-invitation/workspace-invitation.service";
import { WorkspaceMemberModule } from "~/modules/workspace-member/workspace-member.service";
import { SessionContext, WorkspaceContext } from "~/shared/auth";
import { Email } from "~/shared/email";

export const CreateWorkspaceInvitationRequest = WorkspaceInvitation.jsonCreate;

export const CreateWorkspaceInvitationResponse = WorkspaceInvitation.json;

export const CreateWorkspaceInvitationFlow = Effect.fn(
	"flows/CreateWorkspaceInvitationFlow",
)(function* (request: typeof CreateWorkspaceInvitationRequest.Type) {
	const { user } = yield* SessionContext;
	const { member, workspace } = yield* WorkspaceContext;

	const authz = yield* Authorization;
	const email = yield* Email;

	const identityModule = yield* IdentityModule;
	const workspaceMemberModule = yield* WorkspaceMemberModule;
	const workspaceInvitationModule = yield* WorkspaceInvitationModule;

	yield* authz.ensureAllowed({
		action: "workspace:invite_user",
		role: member.role,
	});

	/** Assert that the user is not already a member of the workspace */
	yield* identityModule.retrieveUserByEmail(request.email).pipe(
		Effect.flatMap(
			Option.match({
				onNone: () => Effect.void,
				onSome: (user) =>
					workspaceMemberModule.assertUserNotWorkspaceMember({
						workspaceId: workspace.id,
						userId: user.id,
					}),
			}),
		),
	);

	const createdWorkspaceInvitation =
		yield* workspaceInvitationModule.createOrRenewPendingWorkspaceInvitation({
			workspaceId: workspace.id,
			inviterId: member.id,
			data: request,
		});

	yield* email.sendWorkspaceInvitation({
		email: request.email,
		workspace: workspace,
		inviterName: user.displayName,
		invitationId: createdWorkspaceInvitation.id,
	});

	return createdWorkspaceInvitation satisfies typeof CreateWorkspaceInvitationResponse.Type;
});
