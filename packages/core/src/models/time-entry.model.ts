import type { DbTimeEntry } from "@mason/db/schema";
import { isAfter } from "date-fns";
import { Effect, Schema } from "effect";
import { generateUUID } from "../utils/uuid";
import { MemberId, TaskId, TimeEntryId, WorkspaceId } from "./ids";

export class TimeEntryDateOrderError extends Schema.TaggedError<TimeEntryDateOrderError>()(
  "@mason/core/timeEntryDateOrderError",
  {
    startedAt: Schema.DateFromSelf,
    stoppedAt: Schema.DateFromSelf,
  }
) {}

export class TimeEntry extends Schema.Class<TimeEntry>("@mason/core/timeEntry")(
  {
    id: TimeEntryId,
    // References
    workspaceId: WorkspaceId,
    memberId: MemberId,
    taskId: TaskId,
    // General
    startedAt: Schema.DateFromSelf,
    // Nullable
    stoppedAt: Schema.NullOr(Schema.DateFromSelf),
  }
) {
  private static validate(timeEntry: TimeEntry) {
    return Effect.gen(function* () {
      if (
        timeEntry.stoppedAt &&
        isAfter(timeEntry.startedAt, timeEntry.stoppedAt)
      ) {
        return yield* Effect.fail(
          new TimeEntryDateOrderError({
            startedAt: timeEntry.startedAt,
            stoppedAt: timeEntry.stoppedAt,
          })
        );
      }

      return timeEntry;
    });
  }

  static makeFromDb(dbRecord: DbTimeEntry) {
    return Effect.gen(function* () {
      const timeEntry = new TimeEntry({
        ...dbRecord,
        id: TimeEntryId.make(dbRecord.id),
        memberId: MemberId.make(dbRecord.memberId),
        taskId: TaskId.make(dbRecord.taskId),
        workspaceId: WorkspaceId.make(dbRecord.workspaceId),
      });

      return yield* TimeEntry.validate(timeEntry);
    });
  }

  static makeFromCreate(
    input: typeof TimeEntryToCreate.Type,
    workspaceId: typeof WorkspaceId.Type
  ) {
    return Effect.gen(function* () {
      const timeEntry = new TimeEntry({
        ...input,
        id: TimeEntryId.make(generateUUID()),
        workspaceId: workspaceId,
      });

      return yield* TimeEntry.validate(timeEntry);
    });
  }

  static makeFromUpdate(
    input: typeof TimeEntryToUpdate.Type,
    existing: DbTimeEntry
  ) {
    return Effect.gen(function* () {
      const existingTimeEntry = yield* TimeEntry.makeFromDb(existing);
      const timeEntry = new TimeEntry({
        ...existingTimeEntry,
        ...input,
        workspaceId: WorkspaceId.make(existingTimeEntry.workspaceId),
        memberId: MemberId.make(existingTimeEntry.memberId),
        taskId: TaskId.make(existingTimeEntry.taskId),
      });

      return yield* TimeEntry.validate(timeEntry);
    });
  }
}

export const TimeEntryToCreate = Schema.TaggedStruct("TimeEntryToCreate", {
  // References
  memberId: TimeEntry.fields.memberId,
  taskId: TimeEntry.fields.taskId,
  // General
  startedAt: TimeEntry.fields.startedAt,
  // Nullable
  stoppedAt: Schema.optionalWith(TimeEntry.fields.stoppedAt, {
    default: () => null,
    exact: true,
  }),
});

export const TimeEntryToUpdate = Schema.TaggedStruct("TimeEntryToUpdate", {
  id: TimeEntry.fields.id,
  // References
  memberId: TimeEntry.fields.memberId,
  taskId: TimeEntry.fields.taskId,
  // General
  startedAt: Schema.optionalWith(TimeEntry.fields.startedAt, { exact: true }),
  stoppedAt: Schema.optionalWith(TimeEntry.fields.stoppedAt, { exact: true }),
});
