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
	readonly createTimeEntries: (params: {
		workspaceId: TimeEntry["workspaceId"];
		workspaceMemberId: TimeEntry["workspaceMemberId"];
		data: ReadonlyArray<typeof TimeEntry.jsonCreate.Type>;
	}) => Effect.Effect<
		ReadonlyArray<TimeEntry>,
		| TimeEntryStoppedAtBeforeStartedAtError
		| TimeEntryAlreadyRunningError
		| RepositoryError
	>;
	readonly updateTimeEntry: (params: {
		workspaceId: TimeEntry["workspaceId"];
		id: TimeEntry["id"];
		data: typeof TimeEntry.jsonUpdate.Type;
	}) => Effect.Effect<
		TimeEntry,
		| TimeEntryNotFoundError
		| TimeEntryStoppedAtBeforeStartedAtError
		| TimeEntryAlreadyRunningError
		| RepositoryError
	>;
	readonly hardDeleteTimeEntries: (params: {
		workspaceId: TimeEntry["workspaceId"];
		ids: ReadonlyArray<TimeEntry["id"]>;
	}) => Effect.Effect<void, RepositoryError>;
}

export class TimeModule extends ServiceMap.Service<
	TimeModule,
	TimeModuleShape
>()("@mason/time/TimeModule") {}
