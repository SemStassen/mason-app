import { Schema } from "effect";

export class WorkspaceInvitationDomainError extends Schema.TaggedError<WorkspaceInvitationDomainError>()(
  "workspace-invitation/WorkspaceInvitationDomainError",
  {
    cause: Schema.Unknown,
  }
) {}

export class WorkspaceInvitationNotFoundError extends Schema.TaggedError<WorkspaceInvitationNotFoundError>()(
  "workspace-invitation/WorkspaceInvitationNotFoundError",
  {}
) {}
