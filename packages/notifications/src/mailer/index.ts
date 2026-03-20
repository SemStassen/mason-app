import type { User } from "@mason/core/modules/identity";
import type { Workspace } from "@mason/core/modules/workspace";
import type { WorkspaceInvitation } from "@mason/core/modules/workspace-invitation";
import { ServiceMap } from "effect";
import type { Effect } from "effect";

interface MailerShape {
  sendSignInOtp: (params: {
    email: User["email"];
    otp: string;
  }) => Effect.Effect<void>;
  sendEmailVerificationOtp: (params: {
    email: User["email"];
    otp: string;
  }) => Effect.Effect<void>;
  sendPasswordResetOtp: (params: {
    email: User["email"];
    otp: string;
  }) => Effect.Effect<void>;
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
  "@mason/shared/Mailer"
) {}
