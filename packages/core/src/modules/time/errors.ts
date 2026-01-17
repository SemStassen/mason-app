import { Schema } from "effect";

export class TimeEntryNotFoundError extends Schema.TaggedError<TimeEntryNotFoundError>()(
  "time/TimeEntryNotFoundError",
  {}
) {}
