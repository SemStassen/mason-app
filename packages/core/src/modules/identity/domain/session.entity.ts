import { Model, Schema } from "#shared/effect/index";
import { SessionId, UserId, WorkspaceId } from "#shared/schemas/index";

export class Session extends Model.Class<Session>("Session")(
	{
		id: Model.ServerManaged(SessionId),
		userId: Model.ServerManaged(UserId),
		activeWorkspaceId: Model.ServerManaged(
			Schema.OptionFromNullOr(WorkspaceId),
		),
	},
	{
		identifier: "Session",
		title: "Session",
		description: "A session",
	},
) {}
