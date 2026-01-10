import { Schema } from "effect";

export class InvitationDomainError extends Schema.TaggedError<InvitationDomainError>()(
  "invitation/InvitationDomainError",
  {
    cause: Schema.Unknown,
  }
) {}

export class WorkspaceInvitationNotFoundError extends Schema.TaggedError<WorkspaceInvitationNotFoundError>()(
  "invitation/WorkspaceInvitationNotFoundError",
  {}
) {}
