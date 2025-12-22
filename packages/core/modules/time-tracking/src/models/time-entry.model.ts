import {
  MemberId,
  ProjectId,
  TaskId,
  TimeEntryId,
  WorkspaceId,
} from "@mason/framework/types/ids";
import { JsonRecord } from "@mason/framework/utils/schema";
import { generateUUID } from "@mason/framework/utils/uuid";
import { isAfter } from "date-fns";
import { Effect, Schema } from "effect";

export class TimeEntryDateOrderError extends Schema.TaggedError<TimeEntryDateOrderError>()(
  "@mason/mason/timeEntryDateOrderError",
  {
    startedAt: Schema.DateFromSelf,
    stoppedAt: Schema.DateFromSelf,
  }
) {}

export class TimeEntryMissingStoppedAtError extends Schema.TaggedError<TimeEntryMissingStoppedAtError>()(
  "@mason/mason/timeEntryMissingStoppedAtError",
  {
    startedAt: Schema.DateFromSelf,
  }
) {}

export class TimeEntry extends Schema.Class<TimeEntry>(
  "@mason/mason/timeEntry"
)(
  Schema.Struct({
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
  }).pipe(
    Schema.filter(({ startedAt, stoppedAt }) => isAfter(stoppedAt, startedAt))
  )
) {
  static readonly Create = Schema.Struct({
    memberId: TimeEntry.fields.memberId,
    projectId: TimeEntry.fields.projectId,
    taskId: TimeEntry.fields.taskId,
    startedAt: TimeEntry.fields.startedAt,
    stoppedAt: TimeEntry.fields.stoppedAt,
    notes: TimeEntry.fields.notes,
  });

  static makeFromCreate(
    input: typeof TimeEntry.Create.Type,
    workspaceId: WorkspaceId
  ) {
    return Schema.decodeUnknown(TimeEntry.Create)(input).pipe(
      Effect.map((validated) =>
        TimeEntry.make({
          ...validated,
          id: TimeEntryId.make(generateUUID()),
          workspaceId,
        })
      )
    );
  }

  static readonly Patch = Schema.Struct({
    projectId: Schema.optionalWith(TimeEntry.fields.projectId, { exact: true }),
    taskId: Schema.optionalWith(TimeEntry.fields.taskId, { exact: true }),
    startedAt: Schema.optionalWith(TimeEntry.fields.startedAt, { exact: true }),
    stoppedAt: Schema.optionalWith(TimeEntry.fields.stoppedAt, { exact: true }),
    notes: Schema.optionalWith(TimeEntry.fields.notes, { exact: true }),
  });
  patch(updates: typeof TimeEntry.Patch.Type) {
    return Schema.decodeUnknown(TimeEntry.Patch)(updates).pipe(
      Effect.map((validated) => TimeEntry.make({ ...this, ...validated }))
    );
  }
}
