import { Schema } from "effect";
import { TimeEntry } from "./models/time-entry.model";

export type TimeEntryToCreate = typeof TimeEntryToCreate.Type;
export const TimeEntryToCreate = Schema.TaggedStruct(
  "time-tracking/TimeEntryToCreate",
  TimeEntry.Create.fields
);

export type TimeEntryToUpdate = typeof TimeEntryToUpdate.Type;
export const TimeEntryToUpdate = Schema.TaggedStruct(
  "time-tracking/TimeEntryToUpdate",
  {
    id: TimeEntry.fields.id,
    ...TimeEntry.Patch.fields,
  }
);
