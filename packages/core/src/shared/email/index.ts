import { type Effect, ServiceMap } from "effect";
import type { User } from "~/modules/identity/domain/user.entity";
import type { Workspace } from "~/modules/workspace/domain/workspace.entity";
import type { WorkspaceInvitation } from "~/modules/workspace-invitation/domain/workspace-invitation.entity";
import type { Email as EmailValueObject } from "~/shared/schemas";

interface MailerShape {
	sendWorkspaceInvitation: (params: {
		email: EmailValueObject;
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
