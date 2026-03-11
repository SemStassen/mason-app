import { type Effect, Schema, ServiceMap } from "effect";
import type { RepositoryError } from "~/shared/errors";
import { TimeEntryId } from "~/shared/schemas";
import type { TimeEntry } from "./domain/time-entry.entity";

export class TimeEntryNotFoundError extends Schema.TaggedErrorClass<TimeEntryNotFoundError>()(
	"time/TimeEntryNotFoundError",
	{
		timeEntryId: TimeEntryId,
	},
) {}

interface TimeModuleShape {
	readonly createTimeEntry: (params: {
		workspaceId: TimeEntry["workspaceId"];
		workspaceMemberId: TimeEntry["workspaceMemberId"];
		data: typeof TimeEntry.jsonCreate.Type;
	}) => Effect.Effect<TimeEntry, RepositoryError>;
	readonly updateTimeEntry: (params: {
		id: TimeEntry["id"];
		workspaceId: TimeEntry["workspaceId"];
		data: typeof TimeEntry.jsonUpdate.Type;
	}) => Effect.Effect<TimeEntry, TimeEntryNotFoundError | RepositoryError>;
	readonly hardDeleteTimeEntry: (params: {
		id: TimeEntry["id"];
		workspaceId: TimeEntry["workspaceId"];
	}) => Effect.Effect<void, TimeEntryNotFoundError | RepositoryError>;
}

export class TimeModule extends ServiceMap.Service<
	TimeModule,
	TimeModuleShape
>()("@mason/time/TimeModule") {}
