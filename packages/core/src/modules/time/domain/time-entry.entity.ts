import { Option, Schema } from "effect";
import { Model } from "~/shared/effect";
import {
	ProjectId,
	TaskId,
	TimeEntryId,
	WorkspaceId,
	WorkspaceMemberId,
} from "~/shared/schemas";

export class TimeEntry extends Model.Class<TimeEntry>("TimeEntry")(
	{
		id: Model.ServerManaged(TimeEntryId),
		workspaceId: Model.ServerManaged(WorkspaceId),
		workspaceMemberId: Model.ServerManaged(WorkspaceMemberId),
		projectId: Model.Mutable(ProjectId),
		taskId: Model.MutableOptional(TaskId),
		startedAt: Model.ClientOptional(Schema.DateTimeUtc),
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
