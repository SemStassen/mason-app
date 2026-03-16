import { Option, Schema } from "effect";
import { Model } from "#shared/effect/index";
import {
	ProjectId,
	TaskId,
	TimeEntryId,
	WorkspaceId,
	WorkspaceMemberId,
} from "#shared/schemas/index";

export class TimeEntry extends Model.Class<TimeEntry>("TimeEntry")(
	{
		id: Model.ServerImmutable(TimeEntryId),
		workspaceId: Model.ServerImmutable(WorkspaceId),
		workspaceMemberId: Model.ServerManaged(WorkspaceMemberId),
		projectId: Model.Mutable(ProjectId),
		taskId: Model.MutableOptional(TaskId),
		startedAt: Model.Field({
			select: Schema.DateTimeUtc,
			insert: Schema.DateTimeUtc,
			update: Schema.optionalKey(Schema.DateTimeUtc),
			json: Schema.DateTimeUtc,
			jsonCreate: Schema.optionalKey(Schema.DateTimeUtc),
			jsonUpdate: Schema.optionalKey(Schema.DateTimeUtc),
		}),
		stoppedAt: Model.MutableOptional(Schema.DateTimeUtc),
		notes: Model.MutableOptional(Schema.Json),
	},
	{
		identifier: "TimeEntry",
		title: "Time Entry",
		description: "A time entry tracking work on a project",
	},
) {
	isRunning(): boolean {
		return Option.isNone(this.stoppedAt);
	}
}
