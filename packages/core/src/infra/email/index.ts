import { Context, type Effect } from "effect";
import type { UserDisplayName } from "~/domains/identity";
import type { WorkspaceName } from "~/domains/workspace";
import type {
  Email,
  WorkspaceId,
  WorkspaceInvitationId,
} from "~/shared/schemas";

export class EmailService extends Context.Tag("@mason/shared/EmailService")<
  EmailService,
  {
    sendVerificationOTP: (params: {
      email: Email;
      otp: string;
      type: "sign-in" | "email-verification" | "forget-password";
    }) => Effect.Effect<void>;
    sendWorkspaceInvitation: (params: {
      email: Email;
      workspace: {
        name: WorkspaceName;
        id: WorkspaceId;
      };
      inviterName: UserDisplayName;
      invitationId: WorkspaceInvitationId;
    }) => Effect.Effect<void>;
  }
>() {}
