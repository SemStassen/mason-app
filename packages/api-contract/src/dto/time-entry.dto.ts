import { Schema } from "effect";

const TimeEntry = Schema.Struct({
  id: Schema.NonEmptyString,
  // References
  workspaceId: Schema.NonEmptyString,
  memberId: Schema.NonEmptyString,
  taskId: Schema.NonEmptyString,
  // General
  startedAt: Schema.DateFromSelf,
  // Optional
  stoppedAt: Schema.DateFromSelf,
});

export const CreateTimeEntryRequest = Schema.Struct({
  // References
  memberId: TimeEntry.fields.memberId,
  taskId: TimeEntry.fields.taskId,
  // General
  startedAt: TimeEntry.fields.startedAt,
  // Optional
  stoppedAt: Schema.optionalWith(TimeEntry.fields.stoppedAt, { exact: true }),
});

export const UpdateTimeEntryRequest = Schema.Struct({
  id: TimeEntry.fields.id,
  // References
  memberId: TimeEntry.fields.memberId,
  taskId: Schema.optionalWith(TimeEntry.fields.taskId, { exact: true }),
  // General
  startedAt: Schema.optionalWith(TimeEntry.fields.startedAt, { exact: true }),
  stoppedAt: Schema.optionalWith(TimeEntry.fields.stoppedAt, { exact: true }),
});

export const TimeEntryResponse = Schema.Struct({
  ...TimeEntry.fields,
});
