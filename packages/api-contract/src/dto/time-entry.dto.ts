import { MemberId, TaskId, TimeEntryId, WorkspaceId } from "@mason/types";
import { Schema } from "effect";
import { JsonRecord } from "./data-types";

const TimeEntry = Schema.Struct({
  id: TimeEntryId,
  // References
  workspaceId: WorkspaceId,
  memberId: MemberId,
  taskId: TaskId,
  // General
  startedAt: Schema.DateFromSelf,
  stoppedAt: Schema.DateFromSelf,
  // Optional
  notes: JsonRecord,
});

export const CreateTimeEntryRequest = Schema.Struct({
  // References
  memberId: TimeEntry.fields.memberId,
  taskId: TimeEntry.fields.taskId,
  // General
  startedAt: TimeEntry.fields.startedAt,
  stoppedAt: TimeEntry.fields.stoppedAt,
  // Optional
  notes: Schema.optionalWith(TimeEntry.fields.notes, { exact: true }),
});

export const UpdateTimeEntryRequest = Schema.Struct({
  id: TimeEntry.fields.id,
  // References
  memberId: TimeEntry.fields.memberId,
  taskId: Schema.optionalWith(TimeEntry.fields.taskId, { exact: true }),
  // General
  startedAt: Schema.optionalWith(TimeEntry.fields.startedAt, { exact: true }),
  stoppedAt: Schema.optionalWith(TimeEntry.fields.stoppedAt, { exact: true }),
  // Optional
  notes: Schema.optionalWith(Schema.NullOr(TimeEntry.fields.notes), {
    exact: true,
  }),
});

export const TimeEntryResponse = Schema.Struct({
  ...TimeEntry.fields,
  notes: Schema.NullOr(TimeEntry.fields.notes),
});
