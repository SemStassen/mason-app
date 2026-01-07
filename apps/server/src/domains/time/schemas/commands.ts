import { Schema } from "effect";
import { TimeEntry } from "./time-entry.model";

const TimeEntryFields = TimeEntry.from.from.fields;

export const TimeEntryCommands = {
  Create: Schema.Struct({
    memberId: TimeEntryFields.memberId,
    projectId: TimeEntryFields.projectId,
    taskId: Schema.optionalWith(TimeEntryFields.taskId, { exact: true }),
    startedAt: TimeEntryFields.startedAt,
    stoppedAt: TimeEntryFields.stoppedAt,
    notes: Schema.optionalWith(TimeEntryFields.notes, { exact: true }),
  }),
  Update: Schema.Struct({
    timeEntryId: TimeEntryFields.id,
    projectId: Schema.optionalWith(TimeEntryFields.projectId, { exact: true }),
    taskId: Schema.optionalWith(TimeEntryFields.taskId, { exact: true }),
    startedAt: Schema.optionalWith(TimeEntryFields.startedAt, { exact: true }),
    stoppedAt: Schema.optionalWith(TimeEntryFields.stoppedAt, { exact: true }),
    notes: Schema.optionalWith(TimeEntryFields.notes, { exact: true }),
  }),
};

export type CreateTimeEntryCommand = typeof TimeEntryCommands.Create.Type;
export type UpdateTimeEntryCommand = typeof TimeEntryCommands.Update.Type;
