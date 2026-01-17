import { Schema } from "effect";

export class WorkspaceInvitationTransitionError extends Schema.TaggedError<WorkspaceInvitationTransitionError>()(
  "invitation/WorkspaceInvitationTransitionError",
  {
    cause: Schema.Unknown,
  }
) {}

export class WorkspaceInvitationExpiredError extends Schema.TaggedError<WorkspaceInvitationExpiredError>()(
  "invitation/WorkspaceInvitationExpiredError",
  {}
) {}
