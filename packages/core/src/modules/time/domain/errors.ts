import { Schema } from "effect";

export class TimeEntryTransitionError extends Schema.TaggedError<TimeEntryTransitionError>()(
  "time/TimeEntryTransitionError",
  {
    cause: Schema.Unknown,
  }
) {}
