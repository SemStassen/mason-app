import { Schema } from "effect";

export class TimeDomainError extends Schema.TaggedError<TimeDomainError>()(
  "time/TimeDomainError",
  {
    cause: Schema.Unknown,
  }
) {}

export class TimeEntryNotFoundError extends Schema.TaggedError<TimeEntryNotFoundError>()(
  "time/TimeEntryNotFoundError",
  {}
) {}
