import { Schema } from 'effect';

export class TimeEntry extends Schema.Struct({
  id: Schema.String.pipe(Schema.brand('TimeEntryId')),
  // Extend further
}) {}

export const CreateTimeEntryRequest = Schema.Struct({});
