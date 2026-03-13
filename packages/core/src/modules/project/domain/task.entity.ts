import { Model, Schema } from "#shared/effect/index";
import { ProjectId, TaskId, WorkspaceId } from "#shared/schemas/index";

export class Task extends Model.Class<Task>("Task")(
	{
		id: Model.ServerManaged(TaskId),
		workspaceId: Model.ServerManaged(WorkspaceId),
		projectId: Model.ClientProvided(ProjectId),
		name: Model.Mutable(
			Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(255)),
		),
		archivedAt: Model.ServerManaged(
			Schema.OptionFromNullOr(Schema.DateTimeUtcFromDate),
		),
	},
	{
		identifier: "Task",
		title: "Task",
		description: "A task within a project",
	},
) {}
