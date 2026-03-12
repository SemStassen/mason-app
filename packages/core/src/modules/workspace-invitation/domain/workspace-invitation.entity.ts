import { WorkspaceRole } from "@mason/authorization";
import { Model, Schema } from "~/shared/effect";
import {
	Email,
	WorkspaceId,
	WorkspaceInvitationId,
	WorkspaceMemberId,
} from "~/shared/schemas";

export class WorkspaceInvitation extends Model.Class<WorkspaceInvitation>(
	"WorkspaceInvitation",
)(
	{
		id: Model.ServerManaged(WorkspaceInvitationId),
		inviterId: Model.ServerManaged(WorkspaceMemberId),
		workspaceId: Model.ServerManaged(WorkspaceId),
		email: Model.ClientProvided(Email),
		role: Model.ClientProvided(WorkspaceRole),
		status: Model.ServerManaged(
			Schema.Literals(["pending", "accepted", "rejected", "canceled"]),
		),
		expiresAt: Model.ServerManaged(Schema.DateTimeUtcFromDate),
	},
	{
		identifier: "WorkspaceInvitation",
		title: "Workspace Invitation",
		description: "A workspace invitation",
	},
) {
	isPending(): boolean {
		return this.status === "pending";
	}
}
