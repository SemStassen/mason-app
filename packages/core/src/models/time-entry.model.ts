import type { DbTimeEntry } from "@mason/db/schema";
import { isAfter } from "date-fns";
import { Effect, Schema } from "effect";
import { generateUUID } from "../utils/uuid";
import { MemberId, ProjectId, TaskId, TimeEntryId, WorkspaceId } from "./ids";
import { JsonRecord } from "./data-types";

export class TimeEntryDateOrderError extends Schema.TaggedError<TimeEntryDateOrderError>()(
  "@mason/core/timeEntryDateOrderError",
  {
    startedAt: Schema.DateFromSelf,
    stoppedAt: Schema.DateFromSelf,
  }
) {}

export class TimeEntryMissingStoppedAtError extends Schema.TaggedError<TimeEntryMissingStoppedAtError>()(
  "@mason/core/timeEntryMissingStoppedAtError",
  {
    startedAt: Schema.DateFromSelf,
  }
) {}

export class TimeEntry extends Schema.Class<TimeEntry>("@mason/core/timeEntry")(
  {
    id: TimeEntryId,
    // References
    workspaceId: WorkspaceId,
    memberId: MemberId,
    projectId: ProjectId,
    taskId: Schema.NullOr(TaskId),
    // General
    startedAt: Schema.DateFromSelf,
    stoppedAt: Schema.DateFromSelf,
    notes: Schema.NullOr(JsonRecord),
  }
) {
  private static validate(timeEntry: TimeEntry) {
    return Effect.gen(function* () {
      if (isAfter(timeEntry.startedAt, timeEntry.stoppedAt)) {
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
      if (!dbRecord.stoppedAt) {
        return yield* Effect.fail(
          new TimeEntryMissingStoppedAtError({
            startedAt: dbRecord.startedAt,
          })
        );
      }

      const timeEntry = new TimeEntry({
        startedAt: dbRecord.startedAt,
        stoppedAt: dbRecord.stoppedAt,
        notes: dbRecord.notes,
        id: TimeEntryId.make(dbRecord.id),
        memberId: MemberId.make(dbRecord.memberId),
        projectId: ProjectId.make(dbRecord.projectId),
        taskId: dbRecord.taskId ? TaskId.make(dbRecord.taskId) : null,
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
        id: existingTimeEntry.id,
      });

      return yield* TimeEntry.validate(timeEntry);
    });
  }
}

export const TimeEntryToCreate = Schema.TaggedStruct("TimeEntryToCreate", {
  // References
  memberId: TimeEntry.fields.memberId,
  projectId: TimeEntry.fields.projectId,
  taskId: TimeEntry.fields.taskId,
  // General
  startedAt: TimeEntry.fields.startedAt,
  stoppedAt: TimeEntry.fields.stoppedAt,
  notes: TimeEntry.fields.notes,
});

export const TimeEntryToUpdate = Schema.TaggedStruct("TimeEntryToUpdate", {
  id: TimeEntry.fields.id,
  // References
  projectId: TimeEntry.fields.projectId,
  taskId: TimeEntry.fields.taskId,
  // General
  startedAt: Schema.optionalWith(TimeEntry.fields.startedAt, { exact: true }),
  stoppedAt: Schema.optionalWith(TimeEntry.fields.stoppedAt, { exact: true }),
  notes: Schema.optionalWith(JsonRecord, { exact: true }),
});
