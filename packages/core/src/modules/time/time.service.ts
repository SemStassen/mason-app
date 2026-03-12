import { type Effect, Schema, ServiceMap } from "effect";
import type { RepositoryError } from "~/shared/errors";
import { TimeEntryId } from "~/shared/schemas";
import type { TimeEntry } from "./domain/time-entry.entity";
import type {
	TimeEntryAlreadyRunningError,
	TimeEntryStoppedAtBeforeStartedAtError,
} from "./domain/time-entry.errors";

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
	}) => Effect.Effect<
		TimeEntry,
		| TimeEntryAlreadyRunningError
		| TimeEntryStoppedAtBeforeStartedAtError
		| RepositoryError
	>;
	readonly updateTimeEntry: (params: {
		id: TimeEntry["id"];
		workspaceId: TimeEntry["workspaceId"];
		data: typeof TimeEntry.jsonUpdate.Type;
	}) => Effect.Effect<
		TimeEntry,
		| TimeEntryNotFoundError
		| TimeEntryAlreadyRunningError
		| TimeEntryStoppedAtBeforeStartedAtError
		| RepositoryError
	>;
	readonly hardDeleteTimeEntry: (params: {
		id: TimeEntry["id"];
		workspaceId: TimeEntry["workspaceId"];
	}) => Effect.Effect<void, TimeEntryNotFoundError | RepositoryError>;
}

export class TimeModule extends ServiceMap.Service<
	TimeModule,
	TimeModuleShape
>()("@mason/time/TimeModule") {}
