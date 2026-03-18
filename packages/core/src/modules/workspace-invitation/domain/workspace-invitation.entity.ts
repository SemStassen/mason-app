import { WorkspaceRole } from "@mason/authorization";
import { Model, Schema } from "#shared/effect/index";
import {
  Email,
  WorkspaceId,
  WorkspaceInvitationId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

export class WorkspaceInvitation extends Model.Class<WorkspaceInvitation>(
  "WorkspaceInvitation"
)(
  {
    id: Model.ServerImmutable(WorkspaceInvitationId),
    inviterId: Model.ServerImmutable(WorkspaceMemberId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    email: Model.ServerMutableClientImmutable(Email),
    role: Model.ServerMutableClientImmutable(WorkspaceRole),
    status: Model.ServerMutable(
      Schema.Literals(["pending", "accepted", "rejected", "canceled"])
    ),
    expiresAt: Model.ServerMutable(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "WorkspaceInvitation",
    title: "Workspace Invitation",
    description: "A workspace invitation",
  }
) {
  isPending(): boolean {
    return this.status === "pending";
  }
}
