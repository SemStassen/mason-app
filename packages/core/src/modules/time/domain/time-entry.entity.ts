import { DateTime, Effect, Option, Schema } from "effect";
import { Model } from "~/shared/effect";
import {
	ProjectId,
	TaskId,
	TimeEntryId,
	WorkspaceId,
	WorkspaceMemberId,
} from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";

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
	static create(params: {
		workspaceId: TimeEntry["workspaceId"];
		workspaceMemberId: TimeEntry["workspaceMemberId"];
		projectId: TimeEntry["projectId"];
		taskId?: TimeEntry["taskId"];
		startedAt: TimeEntry["startedAt"];
		stoppedAt?: TimeEntry["stoppedAt"];
		notes?: TimeEntry["notes"];
	}): TimeEntry {
		return TimeEntry.make({
			...params,
			id: TimeEntryId.makeUnsafe(generateUUID()),
			taskId: params.taskId ?? Option.none(),
			stoppedAt: params.stoppedAt ?? Option.none(),
			notes: params.notes ?? Option.none(),
		});
	}

	isRunning(): boolean {
		return Option.isNone(this.stoppedAt);
	}
}
