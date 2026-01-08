import { Schema } from "effect";
import { MemberId } from "~/domains/member";
import { WorkspaceId } from "~/domains/workspace";
import { Email, WorkspaceRole } from "~/shared/schemas";

export type WorkspaceInvitationId = typeof WorkspaceInvitationId.Type;
export const WorkspaceInvitationId = Schema.UUID.pipe(
  Schema.brand("WorkspaceInvitationId")
);

export type WorkspaceInvitationStatus = typeof WorkspaceInvitationStatus.Type;
export const WorkspaceInvitationStatus = Schema.Literal(
  "pending",
  "accepted",
  "rejected",
  "canceled"
);

/**
 * Workspace domain model.
 *
 * Represents a workspace.
 *
 * @category Models
 * @since 0.1.0
 */
export type WorkspaceInvitation = typeof WorkspaceInvitation.Type;
export const WorkspaceInvitation = Schema.TaggedStruct("WorkspaceInvitation", {
  id: WorkspaceInvitationId,
  // References
  inviterId: MemberId,
  workspaceId: WorkspaceId,
  // General
  email: Email,
  role: WorkspaceRole,
  status: WorkspaceInvitationStatus,
  expiresAt: Schema.DateTimeUtcFromSelf,
}).pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "WorkspaceInvitation",
    title: "Workspace Invitation",
    description: "A workspace invitation",
  })
);
