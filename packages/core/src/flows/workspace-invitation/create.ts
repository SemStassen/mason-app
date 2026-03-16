import { Authorization } from "@mason/authorization";
import { Effect, Option } from "effect";
import { IdentityModule } from "#modules/identity/index";
import {
	WorkspaceInvitation,
	WorkspaceInvitationModule,
} from "#modules/workspace-invitation/index";
import { WorkspaceMemberModule } from "#modules/workspace-member/index";
import { SessionContext, WorkspaceContext } from "#shared/auth/index";
import { Mailer } from "#shared/email/index";

export const CreateWorkspaceInvitationRequest = WorkspaceInvitation.jsonCreate;

export const CreateWorkspaceInvitationResponse = WorkspaceInvitation.json;

export const CreateWorkspaceInvitationFlow = Effect.fn(
	"flows/CreateWorkspaceInvitationFlow",
)(function* (request: typeof CreateWorkspaceInvitationRequest.Type) {
	const { user } = yield* SessionContext;
	const { member, workspace } = yield* WorkspaceContext;

	const authz = yield* Authorization;
	const mailer = yield* Mailer;

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

	yield* mailer.sendWorkspaceInvitation({
		email: request.email,
		workspace: workspace,
		inviterName: user.displayName,
		invitationId: createdWorkspaceInvitation.id,
	});

	return createdWorkspaceInvitation satisfies typeof CreateWorkspaceInvitationResponse.Type;
});
