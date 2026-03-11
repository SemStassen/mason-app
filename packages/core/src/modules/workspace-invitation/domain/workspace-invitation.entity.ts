import { WorkspaceRole } from "@mason/authorization";
import { DateTime } from "effect";
import { Model, Schema } from "~/shared/effect";
import {
	Email,
	WorkspaceId,
	WorkspaceInvitationId,
	WorkspaceMemberId,
} from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";

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
	static create(params: {
		workspaceId: WorkspaceInvitation["workspaceId"];
		inviterId: WorkspaceInvitation["inviterId"];
		email: WorkspaceInvitation["email"];
		role: WorkspaceInvitation["role"];
		now: DateTime.Utc;
	}): WorkspaceInvitation {
		return WorkspaceInvitation.make({
			...params,
			id: WorkspaceInvitationId.makeUnsafe(generateUUID()),
			status: "pending",
			expiresAt: WorkspaceInvitation.defaultExpiration(params.now),
		});
	}

	static defaultExpiration(now: DateTime.Utc): DateTime.Utc {
		return DateTime.add(now, { days: 2 });
	}

	isPending(): boolean {
		return this.status === "pending";
	}
}
