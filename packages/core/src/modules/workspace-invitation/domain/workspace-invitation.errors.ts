import { Schema } from "effect";

export class WorkspaceInvitationExpiredError extends Schema.TaggedErrorClass<WorkspaceInvitationExpiredError>()(
	"workspace-invitation/WorkspaceInvitationExpiredError",
	{},
) {}

export class WorkspaceInvitationNotPendingError extends Schema.TaggedErrorClass<WorkspaceInvitationNotPendingError>()(
	"workspace-invitation/WorkspaceInvitationNotPendingError",
	{},
) {}

export class WorkspaceInvitationEmailMismatchError extends Schema.TaggedErrorClass<WorkspaceInvitationEmailMismatchError>()(
	"workspace-invitation/WorkspaceInvitationEmailMismatchError",
	{},
) {}
