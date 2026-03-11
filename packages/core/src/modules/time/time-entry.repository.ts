import { type Effect, type Option, ServiceMap } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { RepositoryError } from "~/shared/errors";
import type { TimeEntry } from "./domain/time-entry.entity";

export interface TimeEntryRepositoryShape {
	readonly insert: (
		data: NonEmptyReadonlyArray<typeof TimeEntry.insert.Type>,
	) => Effect.Effect<NonEmptyReadonlyArray<TimeEntry>, RepositoryError>;
	readonly update: (
		data: typeof TimeEntry.update.Type,
	) => Effect.Effect<TimeEntry, RepositoryError>;
	readonly hardDelete: (params: {
		workspaceId: TimeEntry["workspaceId"];
		timeEntryIds: NonEmptyReadonlyArray<TimeEntry["id"]>;
	}) => Effect.Effect<void, RepositoryError>;
	readonly findById: (
		id: TimeEntry["id"],
	) => Effect.Effect<Option.Option<TimeEntry>, RepositoryError>;
}

export class TimeEntryRepository extends ServiceMap.Service<
	TimeEntryRepository,
	TimeEntryRepositoryShape
>()("@mason/time/TimeEntryRepository") {}
