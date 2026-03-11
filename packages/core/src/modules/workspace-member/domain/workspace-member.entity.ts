import { WorkspaceRole } from "@mason/authorization";
import { Option } from "effect";
import { Model, Schema } from "~/shared/effect";
import { UserId, WorkspaceId, WorkspaceMemberId } from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";

export class WorkspaceMember extends Model.Class<WorkspaceMember>(
	"WorkspaceMember",
)(
	{
		id: Model.ServerManaged(WorkspaceMemberId),
		workspaceId: Model.ServerManaged(WorkspaceId),
		userId: Model.ServerManaged(UserId),
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
) {
	static create(params: {
		workspaceId: WorkspaceMember["workspaceId"];
		userId: WorkspaceMember["userId"];
		role: WorkspaceMember["role"];
	}): WorkspaceMember {
		return WorkspaceMember.make({
			...params,
			id: WorkspaceMemberId.makeUnsafe(generateUUID()),
			deletedAt: Option.none(),
		});
	}
}
