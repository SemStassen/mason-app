import { type Effect, Schema, ServiceMap } from "effect";
import type { RepositoryError } from "#shared/database/index";
import { TimeEntryId } from "#shared/schemas/index";
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
		| TimeEntryStoppedAtBeforeStartedAtError
		| TimeEntryAlreadyRunningError
		| RepositoryError
	>;
	readonly updateTimeEntry: (params: {
		id: TimeEntry["id"];
		workspaceId: TimeEntry["workspaceId"];
		data: typeof TimeEntry.jsonUpdate.Type;
	}) => Effect.Effect<
		TimeEntry,
		| TimeEntryNotFoundError
		| TimeEntryStoppedAtBeforeStartedAtError
		| TimeEntryAlreadyRunningError
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
