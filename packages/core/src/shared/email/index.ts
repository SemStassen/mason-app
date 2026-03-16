import { type Effect, ServiceMap } from "effect";
import type { User } from "#modules/identity/index";
import type { Workspace } from "#modules/workspace/index";
import type { WorkspaceInvitation } from "#modules/workspace-invitation/index";

interface MailerShape {
	sendWorkspaceInvitation: (params: {
		email: User["email"];
		workspace: {
			name: Workspace["name"];
			id: Workspace["id"];
		};
		inviterName: User["displayName"];
		invitationId: WorkspaceInvitation["id"];
	}) => Effect.Effect<void>;
}

export class Mailer extends ServiceMap.Service<Mailer, MailerShape>()(
	"@mason/shared/Mailer",
) {}
