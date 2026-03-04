import { Context, type Effect } from "effect";
import type { User } from "~/modules/identity/domain/user.entity";
import type { Workspace } from "~/modules/workspace/domain/workspace.entity";
import type {
  Email,
  WorkspaceId,
  WorkspaceInvitationId,
} from "~/shared/schemas";

export class EmailService extends Context.Tag("@mason/infra/EmailService")<
  EmailService,
  {
    sendWorkspaceInvitation: (params: {
      email: Email;
      workspace: {
        name: Workspace["name"];
        id: WorkspaceId;
      };
      inviterName: User["displayName"];
      invitationId: WorkspaceInvitationId;
    }) => Effect.Effect<void>;
  }
>() {}
