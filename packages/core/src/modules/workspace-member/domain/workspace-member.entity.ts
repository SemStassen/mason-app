import { WorkspaceRole } from "@mason/authorization";
import { Model, Schema } from "#shared/effect/index";
import { UserId, WorkspaceId, WorkspaceMemberId } from "#shared/schemas/index";

export class WorkspaceMember extends Model.Class<WorkspaceMember>(
	"WorkspaceMember",
)(
	{
		id: Model.ServerImmutable(WorkspaceMemberId),
		workspaceId: Model.ServerImmutable(WorkspaceId),
		userId: Model.ServerImmutable(UserId),
		role: Model.Mutable(WorkspaceRole),
		deletedAt: Model.ServerManaged(
			Schema.OptionFromNullOr(Schema.DateTimeUtcFromDate),
		),
	},
	{
		identifier: "WorkspaceMember",
		title: "Workspace Member",
		description: "A member of a workspace",
	},
) {}
