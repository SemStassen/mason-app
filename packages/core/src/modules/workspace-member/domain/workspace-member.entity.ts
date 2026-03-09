import { WorkspaceRole } from "@mason/authorization";
import { Schema } from "effect";
import { Model } from "~/shared/effect";
import { UserId, WorkspaceId, WorkspaceMemberId } from "~/shared/schemas";

export class WorkspaceMember extends Model.Class<WorkspaceMember>(
  "WorkspaceMember"
)(
  {
    id: Model.ServerManaged(WorkspaceMemberId),
    userId: Model.ServerManaged(UserId),
    workspaceId: Model.ServerManaged(WorkspaceId),
    role: Model.ServerManaged(WorkspaceRole),
    deletedAt: Model.ServerManaged(
      Schema.OptionFromOptionalKey(Schema.DateTimeUtcFromDate)
    ),
  },
  {
    identifier: "WorkspaceMember",
    title: "Workspace Member",
    description: "A member of a workspace",
  }
) {}
