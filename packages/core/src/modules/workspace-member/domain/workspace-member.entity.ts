import { WorkspaceRole } from "@mason/authorization";
import { Model, Schema } from "#shared/effect/index";
import { UserId, WorkspaceId, WorkspaceMemberId } from "#shared/schemas/index";

export class WorkspaceMember extends Model.Class<WorkspaceMember>(
  "WorkspaceMember"
)(
  {
    id: Model.ServerImmutable(WorkspaceMemberId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    userId: Model.ServerImmutable(UserId),
    role: Model.ClientMutable(WorkspaceRole),
    deletedAt: Model.ServerManagedNullable(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "WorkspaceMember",
    title: "Workspace Member",
    description: "A member of a workspace",
  }
) {}
