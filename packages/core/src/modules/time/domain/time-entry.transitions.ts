import { DateTime, Option, Result } from "effect";
import { TimeEntry } from "./time-entry.entity";
import {
	TimeEntryAlreadyRunningError,
	TimeEntryNotRunningError,
	TimeEntryStoppedAtBeforeStartedAtError,
} from "./time-entry.errors";

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
const ensureRunning = (
	timeEntry: TimeEntry,
): Result.Result<void, TimeEntryNotRunningError> =>
	timeEntry.isRunning()
		? Result.succeed(undefined)
		: Result.fail(new TimeEntryNotRunningError());

const ensureNotRunning = (
	timeEntry: TimeEntry,
): Result.Result<void, TimeEntryAlreadyRunningError> =>
	timeEntry.isRunning()
		? Result.fail(new TimeEntryAlreadyRunningError())
		: Result.succeed(undefined);

export const stopTimeEntry = (params: {
	timeEntry: TimeEntry;
	stoppedAt: DateTime.Utc;
}): Result.Result<
	TimeEntry,
	TimeEntryNotRunningError | TimeEntryStoppedAtBeforeStartedAtError
> =>
	Result.gen(function* () {
		yield* ensureRunning(params.timeEntry);
		yield* ensureValidDateRange(
			params.timeEntry.startedAt,
			Option.some(params.stoppedAt),
		);
		return TimeEntry.make({
			...params.timeEntry,
			stoppedAt: Option.some(params.stoppedAt),
		});
	});

export const updateTimeEntry = (params: {
	timeEntry: TimeEntry;
	data: typeof TimeEntry.jsonUpdate.Type;
}): Result.Result<TimeEntry, TimeEntryStoppedAtBeforeStartedAtError> =>
	Result.gen(function* () {
		const patched = TimeEntry.make({
			...params.timeEntry,
			...params.data,
		});

		yield* ensureValidDateRange(patched.startedAt, patched.stoppedAt);

		return patched;
	});
