import { DateTime, Option, Result } from "effect";
import { TimeEntryId } from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import { TimeEntry } from "./time-entry.entity";
import { TimeEntryStoppedAtBeforeStartedAtError } from "./time-entry.errors";

const ensureValidDateRange = (
	startedAt: DateTime.Utc,
	stoppedAt: Option.Option<DateTime.Utc>,
): Result.Result<void, TimeEntryStoppedAtBeforeStartedAtError> =>
	Option.match(stoppedAt, {
		onNone: () => Result.succeed(undefined), // running timer, no end to validate
		onSome: (stopped) =>
			DateTime.isGreaterThanOrEqualTo(stopped, startedAt)
				? Result.succeed(undefined)
				: Result.fail(new TimeEntryStoppedAtBeforeStartedAtError()),
	});

export const createTimeEntry = (params: {
	workspaceId: TimeEntry["workspaceId"];
	workspaceMemberId: TimeEntry["workspaceMemberId"];
	data: typeof TimeEntry.jsonCreate.Type;
	now: DateTime.Utc;
}): Result.Result<TimeEntry, TimeEntryStoppedAtBeforeStartedAtError> =>
	Result.gen(function* () {
		const createdTimeEntry = TimeEntry.make({
			...params.data,
			id: TimeEntryId.makeUnsafe(generateUUID()),
			workspaceId: params.workspaceId,
			workspaceMemberId: params.workspaceMemberId,
			taskId: params.data.taskId ?? Option.none(),
			startedAt: Option.getOrElse(params.data.startedAt, () => params.now),
			stoppedAt: params.data.stoppedAt ?? Option.none(),
			notes: params.data.notes ?? Option.none(),
		});

		yield* ensureValidDateRange(
			createdTimeEntry.startedAt,
			createdTimeEntry.stoppedAt,
		);

		return createdTimeEntry;
	});

export const updateTimeEntry = (params: {
	timeEntry: TimeEntry;
	data: typeof TimeEntry.jsonUpdate.Type;
}): Result.Result<TimeEntry, TimeEntryStoppedAtBeforeStartedAtError> =>
	Result.gen(function* () {
		const updatedTimeEntry = TimeEntry.make({
			...params.timeEntry,
			...params.data,
		});

		yield* ensureValidDateRange(
			updatedTimeEntry.startedAt,
			updatedTimeEntry.stoppedAt,
		);

		return updatedTimeEntry;
	});
