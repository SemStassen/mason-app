import { Context, type Effect, Schema } from "effect";

export class EmailError extends Schema.TaggedError<EmailError>()(
  "framework/EmailError",
  {
    cause: Schema.Unknown,
  }
) {}

export class EmailService extends Context.Tag("@mason/shared/EmailService")<
  EmailService,
  {
    sendVerificationOTP: (params: {
      email: string;
      otp: string;
      type: "sign-in" | "email-verification" | "forget-password";
    }) => Effect.Effect<void, EmailError>;
  }
>() {}
