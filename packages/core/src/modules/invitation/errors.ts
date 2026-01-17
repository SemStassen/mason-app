import { Schema } from "effect";

export class WorkspaceInvitationNotFoundError extends Schema.TaggedError<WorkspaceInvitationNotFoundError>()(
  "invitation/WorkspaceInvitationNotFoundError",
  {}
) {}
