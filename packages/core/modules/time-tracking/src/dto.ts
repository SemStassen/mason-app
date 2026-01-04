import { TimeEntryId } from "@mason/framework";
import { Schema } from "effect";
import { TimeEntry } from "./domain";

export type TimeEntryToCreateDTO = typeof TimeEntryToCreateDTO.Type;
export const TimeEntryToCreateDTO = Schema.Struct({
  memberId: TimeEntry.TimeEntryFields.fields.memberId,
  projectId: TimeEntry.TimeEntryFields.fields.projectId,
  taskId: Schema.optionalWith(TimeEntry.TimeEntryFields.fields.taskId, {
    exact: true,
  }),
  startedAt: TimeEntry.TimeEntryFields.fields.startedAt,
  stoppedAt: TimeEntry.TimeEntryFields.fields.stoppedAt,
  notes: Schema.optionalWith(TimeEntry.TimeEntryFields.fields.notes, {
    exact: true,
  }),
});

export type TimeEntryToUpdateDTO = typeof TimeEntryToUpdateDTO.Type;
export const TimeEntryToUpdateDTO = Schema.Struct({
  id: TimeEntryId,
  projectId: Schema.optionalWith(TimeEntry.TimeEntryFields.fields.projectId, {
    exact: true,
  }),
  taskId: Schema.optionalWith(TimeEntry.TimeEntryFields.fields.taskId, {
    exact: true,
  }),
  startedAt: Schema.optionalWith(TimeEntry.TimeEntryFields.fields.startedAt, {
    exact: true,
  }),
  stoppedAt: Schema.optionalWith(TimeEntry.TimeEntryFields.fields.stoppedAt, {
    exact: true,
  }),
  notes: Schema.optionalWith(TimeEntry.TimeEntryFields.fields.notes, {
    exact: true,
  }),
});
