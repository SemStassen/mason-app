import { Context, type Effect } from "effect";
import type { UserDisplayName } from "~/domains/identity";
import type { WorkspaceName } from "~/domains/workspace";
import type { Email } from "../schemas";

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
      workspaceName: WorkspaceName;
      inviterName: UserDisplayName;
    }) => Effect.Effect<void>;
  }
>() {}
