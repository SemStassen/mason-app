import { Effect, Option, Schema } from "effect";
import { DatabaseService } from "~/infra/db";
import { IdentityModule } from "~/modules/identity/identity.service";
import { WorkspaceInvitation } from "~/modules/workspace-invitation/domain/workspace-invitation.entity";
import { WorkspaceInvitationModule } from "~/modules/workspace-invitation/workspace-invitation.service";
import { WorkspaceMemberModule } from "~/modules/workspace-member/workspace-member.service";
import { SessionContext } from "~/shared/auth";

export const AcceptWorkspaceInvitationRequest = Schema.Struct({
	id: WorkspaceInvitation.fields.id,
});

export const AcceptWorkspaceInvitationResponse = Schema.Void;

export const AcceptWorkspaceInvitationFlow = Effect.fn(
	"flows/AcceptWorkspaceInvitationFlow",
)(function* (request: typeof AcceptWorkspaceInvitationRequest.Type) {
	const { user, session } = yield* SessionContext;

	const db = yield* DatabaseService;

	const workspaceInvitationModule = yield* WorkspaceInvitationModule;
	const workspaceMemberModule = yield* WorkspaceMemberModule;
	const identityModule = yield* IdentityModule;

	yield* db.withTransaction(
		Effect.gen(function* () {
			const invitation =
				yield* workspaceInvitationModule.acceptWorkspaceInvitation({
					id: request.id,
					email: user.email,
				});

			yield* workspaceMemberModule.createWorkspaceMember({
				workspaceId: invitation.workspaceId,
				userId: user.id,
				role: invitation.role,
			});

			yield* identityModule
				.setActiveWorkspace({
					sessionId: session.id,
					workspaceId: Option.some(invitation.workspaceId),
				})
				.pipe(
					Effect.catchTag("identity/SessionNotFoundError", () =>
						Effect.die(
							"invariant violated: session disappeared mid-transaction",
						),
					),
				);
		}),
	);

	return undefined satisfies typeof AcceptWorkspaceInvitationResponse.Type;
});
