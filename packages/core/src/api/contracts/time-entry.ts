import { Schema } from "effect";

import { TimeEntry } from "#modules/time/index";

export const CreateTimeEntryCommand = TimeEntry.jsonCreate;
export const CreateTimeEntryResult = TimeEntry.json;

export const UpdateTimeEntryCommand = Schema.Struct({
  timeEntryId: TimeEntry.fields.id,
  data: TimeEntry.jsonUpdate,
});
export const UpdateTimeEntryResult = TimeEntry.json;

export const DeleteTimeEntryCommand = Schema.Struct({
  timeEntryId: TimeEntry.fields.id,
});
export const DeleteTimeEntryResult = Schema.Void;
