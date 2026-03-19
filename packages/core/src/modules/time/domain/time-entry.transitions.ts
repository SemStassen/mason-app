import { DateTime, Option, Result } from "effect";

import { TimeEntryId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { TimeEntry } from "./time-entry.entity";
import { TimeEntryStoppedAtBeforeStartedAtError } from "./time-entry.errors";

const ensureValidDateRange = (
  startedAt: DateTime.Utc,
  stoppedAt: Option.Option<DateTime.Utc>
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
    const { id, ...rest } = params.data;

    const createdTimeEntry = TimeEntry.make({
      id: Option.getOrElse(id, () => TimeEntryId.makeUnsafe(generateUUID())),
      workspaceId: params.workspaceId,
      workspaceMemberId: params.workspaceMemberId,
      startedAt: params.data.startedAt ?? params.now,
      ...rest,
    });

    yield* ensureValidDateRange(
      createdTimeEntry.startedAt,
      createdTimeEntry.stoppedAt
    );

    return createdTimeEntry;
  });

export const updateTimeEntry = (params: {
  timeEntry: TimeEntry;
  data: typeof TimeEntry.jsonUpdate.Type;
}): Result.Result<
  { entity: TimeEntry; changes: typeof TimeEntry.update.Type },
  TimeEntryStoppedAtBeforeStartedAtError
> =>
  Result.gen(function* () {
    const updatedTimeEntry = TimeEntry.make({
      ...params.timeEntry,
      ...params.data,
    });

    yield* ensureValidDateRange(
      updatedTimeEntry.startedAt,
      updatedTimeEntry.stoppedAt
    );

    return {
      entity: updatedTimeEntry,
      changes: params.data,
    };
  });
